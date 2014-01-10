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

      var possibleValues = [25,50,75,100];
      var that = this;

       Shared.api
      .resource('Preferences/UserPreferences')
      .params({"module": "mail","preference":"max_email_per_page"})
      .done(function(result){

        var rpp = 25;

        rpp = result.mail.max_email_per_page;

        var newData = {
          _: _ ,
          resultsperpage : rpp,
          possibleValues : possibleValues,
        };

        var compiledTemplate = _.template( settingsResultsPerPageListTemplate, newData );
        that.$el.html( compiledTemplate ); 

        $(that.elementID).empty().html(that.$el);

        that.loaded();

      }).fail(function(result) {

      }).execute();


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

      Shared.api
      .resource('Preferences/ChangeUserPreferences')
      .params({"module": "mail","preference":"max_email_per_page","value":valueSelected})
      .done(function(result){

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

      }).fail(function(result) {

      }).execute();



      

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsResultsPerPageListView;
  
});
