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
      'click #btn-login' : 'loginUser'
    },
    loginUser: function(ev) {

      //Shared.api.context("/api/").crossdomain("http://api.expresso.pr.gov.br").phoneGap(false);

      var userName = $("#username").val();
      var passwd = $("#password").val();

      var serverURL = $("#serverURL").val();

      var isPhoneGap = $("#isPhoneGap").is(':checked');

      Shared.api.phoneGap(isPhoneGap);

      if (isPhoneGap) {
        Shared.api.context(serverURL).crossdomain(serverURL);
      } else {
        Shared.api.context("/api/").crossdomain(serverURL);
      }

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

        //Shared.router.navigate('Home',{trigger: true});
                
        return false;
      })
      .fail(function(result){

        alert(result.error.message);

        //that.render();

        //$("#mainAppPageContent").empty().append(that.$el);
        //$("#mainAppPageContent").html(loginTemplate);
        Shared.router.navigate('',{trigger: true});
        
        
        return false;
      })
      .execute();



      return false;
    },

    logoutUser: function () {

      var loadingView = new LoadingView({ el: $("#mainAppPageContent") });
      loadingView.render();

      Shared.api
      .resource('Logout')
      .done(function(result){

        var expressoValues = {auth: "", "profile":""};

        Shared.api.setLocalStorageValue("expresso",expressoValues);

        //window.location.href = 'Login';

        Shared.router.navigate('Login',true);
                
        return false;
      })
      .fail(function(result){
        //if (result.error.code == 7) {
          Shared.router.navigate('Login',{trigger: true});
        //}
        alert(result.error.message);
        return false;
      })
      .execute();
    }

  });

  return LoginView;
  
});
