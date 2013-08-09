// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/login/LoginView',
  'views/home/HomeView',
  'views/mail/DetailMessageView',
  'views/settings/SettingsListView',
], function($, _, Backbone, Shared, LoginView, HomeView, DetailMessageView,SettingsListView) {
  
  var AppRouter = Backbone.Router.extend({

    routes: {

      'Home' : 'homeView',
      'Login' : 'loginView',
      'Mail/Folders/*folderID' : 'openFolderView',
      'Mail/Messages/:msgID/*folderID' : 'detailMessageView',
      'Settings' : 'settingsListView',
      'Settings/:secondViewName' : 'settingsListView',
      '*actions': 'defaultAction'

    },
    start: function() {
      Backbone.history.start({pushState: true});
    }
    
  });

  var initialize = function(){

    var app_router = new AppRouter;

    app_router.on('route:homeView', function (actions) {
     
        var homeView = new HomeView();
        homeView.render();
    });

    app_router.on('route:openFolderView', function (PfolderID) {
  
      var homeView = new HomeView({folderID: PfolderID});
      homeView.loadMessagesInFolder(PfolderID,'');

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

    app_router.on('route:detailMessageView', function (msgID,folderID) {

      var detailMessageView = new DetailMessageView();
      detailMessageView.folderID = folderID;
      detailMessageView.msgID = msgID;

      detailMessageView.render();
  
    });

    app_router.on('route:settingsListView', function (secondViewName) {

      var settingsListView = new SettingsListView();
      settingsListView.secondViewName = secondViewName;
      settingsListView.render();

      Shared.menuView.selectMenu(5);
  
    });

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
