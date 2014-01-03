define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsChangePasswordListTemplate.html'
], function($, _, Backbone, Shared, settingsChangePasswordListTemplate){

  var SettingsChangePasswordListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsChangePasswordListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

      Shared.menuView.renderContextMenu('changePassword',{});

    },

    SaveChangePassword: function() {

      var senhaAtual = $("#senhaAtual").val();
      var novaSenha = $("#novaSenha").val();
      var repetirNovaSenha = $("#repetirNovaSenha").val();

      var errorMessage = "";

      if (novaSenha != repetirNovaSenha) {
        errorMessage = "As novas senhas não conferem!";
      }

      if ((senhaAtual == novaSenha) || (senhaAtual == repetirNovaSenha)) { 
        errorMessage = "A nova senha deve ser diferente da senha atual!";
      }

      if ((repetirNovaSenha == "") || (repetirNovaSenha == undefined)) { 
        errorMessage = "Repetição da nova senha não informada/inválida!";
      }

      if ((novaSenha == "") || (novaSenha == undefined)) { 
        errorMessage = "Nova senha não informada/inválida!";
      }

      if ((senhaAtual == "") || (senhaAtual == undefined)) { 
        errorMessage = "Senha atual não informada/inválida!";
      }

      if (errorMessage == "") {

        Shared.showMessage({
          type: "success",
          icon: 'icon-settings',
          title: "Sua nova senha foi alterada com sucesso!",
          description: "",
          elementID: "#pageMessage",
        });

        Shared.router.navigate("/Settings",{trigger: true});

      } else {

        Shared.showMessage({
          type: "error",
          icon: 'icon-settings',
          title: errorMessage,
          description: "",
          elementID: "#pageMessage",
        });

        Shared.router.navigate("/Settings/ChangePassword",{trigger: true});
      }

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsChangePasswordListView;
  
});
