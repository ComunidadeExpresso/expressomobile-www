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

      var newData = {
        _: _ ,
        resultsperpage : Shared.settings.resultsPerPage,
        possibleValues : possibleValues,
      };

      var compiledTemplate = _.template( settingsResultsPerPageListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      $(this.elementID).empty().html(this.$el);

      this.loaded();

      //Shared.menuView.renderContextMenu('resultsperpage',{});

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

      

      // var elementID = $(parent).attr("id");

      // $("#" +elementID + "_unread").removeClass("msg-unread");

      // Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsResultsPerPageListView;
  
});
