define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsMailSignatureListTemplate.html'
], function($, _, Backbone, Shared, settingsMailSignatureListTemplate){

  var SettingsMailSignatureListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var mailsign = '';

      var that = this;

      Shared.api
      .resource('Preferences/UserPreferences')
      .params({"module": "mail","preference":"signature"})
      .done(function(result){

        mailsign = result.mail.signature;

        var newData = {
          _: _ ,
          mailsignature : mailsign
        };

        var compiledTemplate = _.template( settingsMailSignatureListTemplate, newData );
        that.$el.html( compiledTemplate ); 

        that.loaded();

        Shared.menuView.renderContextMenu('mailsignature',{});

      }).fail(function(result) {

      }).execute();


    },

    SaveMailSignature: function() {

      var value = $("#assinaturaEmail").val();

      Shared.api
      .resource('Preferences/ChangeUserPreferences')
      .params({"module": "mail","preference":"signature","value":value})
      .done(function(result){

        Shared.settings.mailSignature = value;

        Shared.saveSettingsToLocalStorage();

        Shared.showMessage({
          type: "success",
          icon: 'icon-settings',
          title: "Sua preferência foi salva com sucesso!",
          description: "",
          elementID: "#pageMessage",
        });

        Shared.router.navigate("/Settings",{trigger: true});

      }).fail(function(result) {

      }).execute();

      

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsMailSignatureListView;
  
});
