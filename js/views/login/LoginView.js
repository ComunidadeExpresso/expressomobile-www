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
  'collections/home/ServersCollection',
], function($, _, Backbone, Shared, MessagesModel, MessagesCollection, loginTemplate,LoadingView,HomeView,expressoIM,ExpressoCollection,ServersCollection){

  var LoginView = Backbone.View.extend({

    errors: false,

    render: function(){


      var collection = new ServersCollection();

      var that = this;

      collection.done(function (data) {

        var newData = {
          servers: data.models,
          _: _
        }

        var compiledTemplate = _.template( loginTemplate, newData );

        that.$el.html(compiledTemplate);
        that.$el.attr("style","top: -53px; position: relative;");
        $("#mainAppPageContent").empty().append(that.$el);

        if (Shared.betaVersion) {
          $("#beta").removeClass("hidden");
        }

      })
      .fail(function (error) {
        console.log("ERRO");
        Shared.handleErrors(error);
      })
      .getServers();

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

      serverURL = serverURL.replace("https://","http://");

      var isPhoneGap = Shared.api.phoneGap();

      if (isPhoneGap) {
        Shared.api.context(serverURL).crossdomain(serverURL);
      } else {
        Shared.api.context(Shared.context).crossdomain(serverURL);
      }

      this.errors = false;

      if (passwd == "") {
        Shared.showMessage({
            type: "error",
            icon: 'icon-expresso',
            title: "Senha não informada/inválida!",
            description: "",
            elementID: "#pageMessage",
          });
        this.errors = true;
      }

      if (userName == "") {
        Shared.showMessage({
            type: "error",
            icon: 'icon-expresso',
            title: "Usuário não informado/inválido!",
            description: "",
            elementID: "#pageMessage",
          });
        this.errors = true;
      }

      
      var that = this;      

      if (!that.errors) {

        var loadingView = new LoadingView({ el: $("#loadingLogin") });
        loadingView.render();

        Shared.api
        .resource('Login')
        .params({user:userName,password:passwd})
        .done(function(result){

          var expressoValues = {
            auth: Shared.api.auth(), 
            "profile":result.profile[0],
            username: userName, 
            phoneGap: isPhoneGap,
            serverAPI: serverURL
          };

          Shared.password = passwd;

          Shared.profile = expressoValues.profile;

          Shared.api.setLocalStorageValue("expresso",expressoValues);

          if ((Shared.isAndroid()) && (Shared.isPhonegap())) {

            Shared.service.setConfig(serverURL,Shared.api.auth());
            Shared.service.startService();
            setTimeout(function() {
              Shared.service.setConfig(serverURL,Shared.api.auth(),userName,passwd);
              Shared.service.enableTimer();
            },10000);


            window.plugins.webintent.createAccount({accountName : userName, accountPassword: passwd, accountAuthToken: Shared.api.auth(), accountAPIURL: serverURL}, 
             function(result) {

                
             }, function(error) {
                alert(error);
             });
          }
          
          

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

        Shared.scrollMenu = null;

        Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

          var isPhoneGap = Shared.api.phoneGap();

          expressoValue.auth = "";
          expressoValue.profile = "";
          expressoValue.username = "";
          expressoValue.password = "";
          expressoValue.phoneGap = isPhoneGap;
          expressoValue.serverAPI = "";

          if (Shared.isAndroid()) {
            Shared.service.disableTimer();
            Shared.service.stopService();
          }

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
