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

      var newData = {
        _: _ ,
        mailsignature : Shared.settings.mailSignature
      };

      var compiledTemplate = _.template( settingsMailSignatureListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

      Shared.menuView.renderContextMenu('mailsignature',{});

    },

    SaveMailSignature: function() {

      var value = $("#assinaturaEmail").val();

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

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsMailSignatureListView;
  
});
