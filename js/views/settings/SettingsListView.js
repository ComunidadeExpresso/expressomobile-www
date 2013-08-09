define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsListTemplate.html',
  'views/settings/SettingsAboutListView',
  'views/settings/SettingsChangePasswordListView',
  'views/settings/SettingsCreditsListView',
  'views/settings/SettingsMailSignatureListView',
  'views/settings/SettingsResultsPerPageListView',
  'views/settings/SettingsSupportListView',
], function($, _, Backbone, Shared, settingsListTemplate,SettingsAboutListView,SettingsChangePasswordListView,SettingsCreditsListView,SettingsMailSignatureListView,SettingsResultsPerPageListView,SettingsSupportListView){

  var SettingsListView = Backbone.View.extend({

    secondViewName: '',

    render: function(){

      var that = this;

      var primaryElementID = "#content";
      var detailElementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        detailElementID = "#content";
      }

      if (this.secondViewName != null) {
        console.log(this.secondViewName);
        if (this.secondViewName == "Support") {
           var secondView = new SettingsSupportListView({ el: $(detailElementID) });
           secondView.render();
        }
        if (this.secondViewName == "About") {
           var secondView = new SettingsAboutListView({ el: $(detailElementID) });
           secondView.render();
        }
        if (this.secondViewName == "Credits") {
           var secondView = new SettingsCreditsListView({ el: $(detailElementID) });
           secondView.render();
        }
        if (this.secondViewName == "ChangePassword") {
           var secondView = new SettingsChangePasswordListView({ el: $(detailElementID) });
           secondView.render();
        }
        if (this.secondViewName == "ResultsPerPage") {
           var secondView = new SettingsResultsPerPageListView({ el: $(detailElementID) });
           secondView.render();
        }
        if (this.secondViewName == "MailSignature") {
           var secondView = new SettingsMailSignatureListView({ el: $(detailElementID) });
           secondView.render();
        }
      } else {
        var newData = {
          _: _ 
        };

        var compiledTemplate = _.template( settingsListTemplate, newData );
        $(primaryElementID).html( compiledTemplate ); 
      }

      this.loaded();

    },

    initialize: function() {
      this.secondViewName = "";
    },

    loaded: function () 
    {

      var that = this;
      Shared.scroll = new iScroll('wrapper');

    }
  });

  return SettingsListView;
  
});
