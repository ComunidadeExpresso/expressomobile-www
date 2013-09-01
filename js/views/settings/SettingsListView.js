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
  'views/home/LoadingView',
], function($, _, Backbone, Shared, settingsListTemplate,SettingsAboutListView,SettingsChangePasswordListView,SettingsCreditsListView,SettingsMailSignatureListView,SettingsResultsPerPageListView,SettingsSupportListView,LoadingView){

  var SettingsListView = Backbone.View.extend({

    secondViewName: '',

    render: function(){

      var that = this;

      var primaryElementID = "#content";
      var detailElementID = "#contentDetail";

      $(detailElementID).html("");

      if (Shared.isSmartPhoneResolution()) {
        detailElementID = "#content";
      }
      
      if (this.secondViewName != null) {
        var loadingView = new LoadingView({ el: $(detailElementID) });
        loadingView.render();

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
        

        var loadingView = new LoadingView({ el: $(primaryElementID) });
        loadingView.render();

        Shared.menuView.context.hideMenu();

        var that = this;

        setTimeout(function() {

          var newData = {
            _: _ 
          };

          var compiledTemplate = _.template( settingsListTemplate, newData );
          $(primaryElementID).html( compiledTemplate );

          that.loaded();

        },Shared.timeoutDelay);

        
      }

      Shared.setDefaultIMListeners();

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
