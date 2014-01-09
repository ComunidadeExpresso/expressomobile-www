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

      Shared.menuView.renderContextMenu('changePassword',{saveCallBack: this.SaveChangePassword, parentCallBack: this});

    },

    SaveChangePassword: function(callBack) {

      var senhaAtual = $("#senhaAtual").val();
      var novaSenha = $("#novaSenha").val();
      var repetirNovaSenha = $("#repetirNovaSenha").val();

      Shared.menuView.renderContextMenu('changePassword',{saveCallBack: callBack.SaveChangePassword, parentCallBack: callBack});

      var errorMessage = "";

      if (novaSenha != repetirNovaSenha) {
        errorMessage = "Nova Senhas são diferentes!";
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


        var that = this;

        senhaAtual = encodeURIComponent(senhaAtual);
        novaSenha = encodeURIComponent(novaSenha);
        repetirNovaSenha = encodeURIComponent(repetirNovaSenha);


        Shared.api
        .resource('Preferences/ChangePassword')
        .params({currentPassword:senhaAtual,newPassword_1:novaSenha,newPassword_2:repetirNovaSenha})
        .done(function(result){

          Shared.showMessage({
            type: "success",
            icon: 'icon-settings',
            title: "Sua nova senha foi alterada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          });

          Shared.router.navigate("/Settings",{trigger: true});

        }).fail(function(result){

          var errorMessage = '';

          switch(result.error.code) {
            case "1054":
              errorMessage = "Senha atual Não Informada/Inválida!";
              break;
            case "1055":
              errorMessage = "Nova Senha Não Informada/Inválida!";
              break;
            case "1056":
              errorMessage = "Nova Senhas são diferentes!";
              break;
            case "1057":
              errorMessage = "Senha atual Não Informada/Inválida!";
              break;
            case "1058":
              errorMessage = "Seu usuário não possui permissão de alterar a senha.";
              break;
            case "1059":
              errorMessage = "Sua senha deve conter 8 ou mais caracteres.";
              break;
            case "1060":
              errorMessage = "Sua senha deve conter no mínimo 2 números ou caracteres especiais.";
              break;
            case "1061":
              errorMessage = "Não foi possível alterar a senha, não existe suporte para certificados digitais.";
              break;
            default:
          }

          Shared.showMessage({
            type: "error",
            icon: 'icon-settings',
            title: errorMessage,
            description: "",
            elementID: "#pageMessage",
          });

          

        }).execute();

      } else {

        Shared.showMessage({
          type: "error",
          icon: 'icon-settings',
          title: errorMessage,
          description: "",
          elementID: "#pageMessage",
        });

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
