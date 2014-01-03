define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsResultsPerPageListTemplate.html'
], function($, _, Backbone, Shared, settingsResultsPerPageListTemplate){

  var SettingsResultsPerPageListView = Backbone.View.extend({

    elementID: "#content",

    render: function(){

      var possibleValues = [10,20,30,50,100];
      var that = this;

      Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

        var rpp = 30;

        if (expressoValue.settings != undefined) {
          Shared.settings = expressoValue.settings;
          rpp = expressoValue.settings.resultsPerPage;
        }

        var newData = {
          _: _ ,
          resultsperpage : rpp,
          possibleValues : possibleValues,
        };

        var compiledTemplate = _.template( settingsResultsPerPageListTemplate, newData );
        that.$el.html( compiledTemplate ); 

        $(that.elementID).empty().html(that.$el);

        that.loaded();

      });

    },

    events: {
      "click a.detailListItemLink": "selectListItem"
    },

    selectListItem: function(e){

      e.preventDefault();

      $('#detailList li').each(function() { 
        if ($(this).hasClass('listDivision').toString() == 'false') {
          $(this).removeClass( 'selected' ); 
        }
      }); 

      var parent = $(e.target).parent();

      if (parent.hasClass("detailListItemLink")) {
        parent = parent.parent();
      }

      parent.addClass("selected");

      var valueSelected = $(parent).attr("value");

      Shared.settings.resultsPerPage = valueSelected;

      Shared.saveSettingsToLocalStorage();

      Shared.showMessage({
        type: "success",
        icon: 'icon-settings',
        title: "Sua preferência foi salva com sucesso!",
        description: "",
        elementID: "#pageMessage",
      });

      if (Shared.isSmartPhoneResolution()) {
        Shared.router.navigate("/Settings",{trigger: true});
      }

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsResultsPerPageListView;
  
});
