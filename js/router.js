// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/login/LoginView',
  'views/home/HomeView',
  'views/mail/DetailMessageView',
], function($, _, Backbone, Shared, LoginView, HomeView, DetailMessageView) {
  
  var AppRouter = Backbone.Router.extend({

    routes: {

      'Home' : 'homeView',
      'Login' : 'loginView',
      'Mail/Messages/:folderID/:msgID' : 'detailMessageView',
      '*actions': 'defaultAction'

    },
    start: function() {
      Backbone.history.start({pushState: true});
    }
    
  });

  var initialize = function(){

    var app_router = new AppRouter;

    app_router.on('route:homeView', function (actions) {
     
       // We have no matching route, lets display the home page 
        var homeView = new HomeView();
        homeView.render();
    });

    app_router.on('route:loginView', function (actions) {

       var loginView = new LoginView();
       loginView.render();
  
    });

    app_router.on('route:defaultAction', function (actions) {

      var authCookie = Shared.api.readCookie("auth");

      if (authCookie != null) {
        Shared.api.auth(authCookie);
      }

      if (Shared.api.auth()) {
        app_router.navigate("Home",true);
      } else {
        app_router.navigate("Login",true);
      }

    });

    app_router.on('route:detailMessageView', function (folderID,msgID) {

      var detailMessageView = new DetailMessageView();
      detailMessageView.folderID = folderID;
      detailMessageView.msgID = msgID;

      detailMessageView.render();
  
    });

    /*

    var new_conf = Shared.api.conf();
    //console.log(new_conf);

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
      
        //var new_conf = Shared.api.conf();
        console.log(new_conf);
        //options.url = new_conf.url;
        options.type = new_conf.type;
        options.id = new_conf.id;
        options.data = new_conf.data;
        options.url = "http://localhost:8888/expresso-www" + new_conf.url + options.url;

        console.log(options);
    });
 */
/* 
    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
      options.url = "http://localhost:8888/expresso-www/" + options.url;
    });
*/

    return app_router;

  };

  AppRouter.initialize = initialize;

  return AppRouter;

});
