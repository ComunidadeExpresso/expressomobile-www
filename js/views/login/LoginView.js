define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'models/mail/MessagesModel',
  'collections/mail/MessagesCollection',
  'text!templates/login/loginTemplate.html'
], function($, _, Backbone, Shared, MessagesModel, MessagesCollection, loginTemplate){

  var LoginView = Backbone.View.extend({
    el: $("#mainAppPageContent"),

    render: function(){

      this.$el.html(loginTemplate);

    },
    events: {
      'click #btn-login' : 'loginUser'
    },
    loginUser: function(ev) {

      Shared.api
      .resource('Login')
      .params({user:'demo',password:'demo22'})
      .done(function(result){

        Shared.api.setCookie("auth",Shared.api.auth());
        Shared.api.setCookie("profile",JSON.stringify(result));

        Shared.router.navigate('Home',{trigger: true});
                
        return false;
      })
      .fail(function(result){
        if (result.error.code == 7) {
          Shared.router.navigate('Login',{trigger: true});
        }
        alert(result.error.message);
        return false;
      })
      .execute();

      return false;
    }

  });

  return LoginView;
  
});
