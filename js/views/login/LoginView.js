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
], function($, _, Backbone, Shared, MessagesModel, MessagesCollection, loginTemplate,LoadingView,HomeView){

  var LoginView = Backbone.View.extend({
    el: $("#mainAppPageContent"),

    render: function(){

      this.$el.html(loginTemplate);

    },
    events: {
      'click #btn-login' : 'loginUser'
    },
    loginUser: function(ev) {

      //Shared.api.context("/api/").crossdomain("http://api.expresso.pr.gov.br").phoneGap(false);

      var userName = $("#username").val();
      var passwd = $("#password").val();

      var loadingView = new LoadingView({ el: $("#loadingLogin") });
      loadingView.render();

      Shared.api
      .resource('Login')
      .params({user:userName,password:passwd})
      .done(function(result){

        Shared.api.setCookie("auth",Shared.api.auth());
        Shared.api.setCookie("profile",JSON.stringify(result.profile[0]));

        var homeView = new HomeView();
        homeView.profile = result.profile[0];
        homeView.render();

        //Shared.router.navigate('Home',{trigger: true});
                
        return false;
      })
      .fail(function(result){
        $("#mainAppPageContent").html(loginTemplate);
        //Shared.router.navigate('Login',{trigger: true});
        alert(result.error.message);
        
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

        Shared.api.setCookie("auth","");
        Shared.api.setCookie("profile","");

        Shared.router.navigate('Login',{trigger: true});
                
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
