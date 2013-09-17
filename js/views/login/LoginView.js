define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'models/mail/MessagesModel',
  'collections/mail/MessagesCollection',
  'text!templates/login/loginTemplate.html',
  'views/home/LoadingView',
  'views/home/HomeView',
  'expressoIM',
  'collections/home/ExpressoCollection',
], function($, _, Backbone, Shared, MessagesModel, MessagesCollection, loginTemplate,LoadingView,HomeView,expressoIM,ExpressoCollection){

  var LoginView = Backbone.View.extend({

    render: function(){

      this.$el.html(loginTemplate);
      $("#mainAppPageContent").empty().append(this.$el);

    },
    events: {
      'click #btn-login' : 'loginUser',
      "keydown #username" : "keydownUserName",
      "keydown #password" : "keydownPassword",
    },

    keydownUserName: function(e) {
      if ( (e.which == 13 && !e.shiftKey) ) {
        $("#password").focus();
      }
    },

    keydownPassword: function(e) {
      if ( (e.which == 13 && !e.shiftKey) ) {
        this.loginUser();
      }
    },


    loginUser: function(ev) {

      var userName = $("#username").val();
      var passwd = $("#password").val();

      var serverURL = $("#serverURL").val();

      //var isPhoneGap = $("#isPhoneGap").is(':checked');

      //Shared.api.phoneGap(isPhoneGap);

      var isPhoneGap = Shared.api.phoneGap();

      if (isPhoneGap) {
        Shared.api.context(serverURL).crossdomain(serverURL);
      } else {
        Shared.api.context("/api/").crossdomain(serverURL);
      }

      var errors = false;

      if (passwd == "") {
        Shared.showMessage({
            type: "error",
            icon: 'icon-expresso',
            title: "Senha não informada/inválida!",
            description: "",
            elementID: "#pageMessage",
          });
        errors = true;
      }

      if (userName == "") {
        Shared.showMessage({
            type: "error",
            icon: 'icon-expresso',
            title: "Usuário não informado/inválido!",
            description: "",
            elementID: "#pageMessage",
          });
        errors = true;
      }

      

      if (!errors) {

        var loadingView = new LoadingView({ el: $("#loadingLogin") });
        loadingView.render();

        var that = this; 

        Shared.api
        .resource('Login')
        .params({user:userName,password:passwd})
        .done(function(result){

          var expressoValues = {
            auth: Shared.api.auth(), 
            "profile":result.profile[0],
            username: userName, 
            password: passwd,
            phoneGap: isPhoneGap,
            serverAPI: serverURL
          };

          Shared.api.setLocalStorageValue("expresso",expressoValues);

          var homeView = new HomeView();
          homeView.profile = result.profile[0];
          homeView.render();

          Shared.showMessage({
            type: "success",
            icon: 'icon-expresso',
            title: "Bem vindo ao Expresso!",
            description: "",
            timeout: 2000,
            elementID: "#pageMessage",
          });

          //Shared.router.navigate('Home',{trigger: true});
                  
          return false;
        })
        .fail(function(result){

          if (result.error.code == 5) {

            Shared.showMessage({
              type: "error",
              icon: 'icon-expresso',
              title: "Usuário ou senha inválidos!",
              description: "",
              timeout: 0,
              elementID: "#pageMessage",
            });

            setTimeout(function() {

              Shared.router.navigate('',{trigger: true});

            },2000);

          }

          return false;
        })
        .execute();

      }



      return false;
    },

    logoutUser: function () {

      var loadingView = new LoadingView({ el: $("#mainAppPageContent") });
      loadingView.render();

      Shared.api
      .resource('Logout')
      .done(function(result){

        Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

          var isPhoneGap = Shared.api.phoneGap();

          expressoValue.auth = "";
          expressoValue.profile = "";
          expressoValue.username = "";
          expressoValue.password = "";
          expressoValue.phoneGap = isPhoneGap;
          expressoValue.serverAPI = "";

          Shared.api.setLocalStorageValue("expresso",expressoValue);

          Shared.router.navigate('Login',true);


        });

        return false;
      })
      .fail(function(error){

        Shared.handleErrors(error);
        
        return false;
      })
      .execute();
    }

  });

  return LoginView;
  
});
