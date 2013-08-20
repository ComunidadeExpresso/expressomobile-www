// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/login/LoginView',
  'views/home/HomeView',
  'views/mail/DetailMessageView',
  'views/mail/ComposeMessageView',
  'views/settings/SettingsListView',
  'views/contacts/ContactsListView',
  'views/contacts/DetailsContactView',
  'views/calendar/CalendarListView',
  'views/chat/ChatListView',
], function($, _, Backbone, Shared, LoginView, HomeView, DetailMessageView, ComposeMessageView,SettingsListView,ContactsListView,DetailsContactView,CalendarListView,ChatListView) {
  
  var AppRouter = Backbone.Router.extend({

    routes: {

      'Home' : 'homeView',
      'Login' : 'loginView',
      'Mail/Folders/*folderID' : 'openFolderView',
      'Mail/Message/New' : 'composeMessageView',
      'Mail/Messages/:msgID/*folderID' : 'detailMessageView',
      'Contacts' : 'contactsListView',
      'Contacts/:secondViewName' : 'contactsListView',
      'Contacts/:secondViewName/:contactID' : 'detailsContactView',
      'Calendar' : 'calendarListView',
      'Calendar/:secondViewName' : 'calendarListView',
      'Chat' : 'chatListView',
      'Chat/:secondViewName' : 'chatListView',
      'Settings' : 'settingsListView',
      'Settings/:secondViewName' : 'settingsListView',
      'Logout' : 'logoutView',
      'ContextMenu' : 'contextMenuView',
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
      Shared.menuView.closeMenu();
      homeView.loadMessagesInFolder(PfolderID,'');

      if (PfolderID == 'INBOX') {
        Shared.menuView.selectMenu(1);
      } else {
        Shared.menuView.selectMenu(0);
      }

    });

    app_router.on('route:loginView', function (actions) {

       var loginView = new LoginView();
       loginView.render();
  
    });

    app_router.on('route:logoutView', function (actions) {

      var loginView = new LoginView();
      loginView.logoutUser();
  
    });

    app_router.on('route:defaultAction', function (actions) {

      var expressoValue = Shared.api.getLocalStorageValue("expresso");

      if (expressoValue != null) {

        var authValue = expressoValue.auth;

        if (authValue != null) {
          Shared.api.auth(authValue);
        }

        Shared.profile = expressoValue.profile;

      }

      if (Shared.api.auth()) {
        app_router.navigate("Home",{ trigger: true });
      } else {
        app_router.navigate("Login",{ trigger: true });
      }

    });

    app_router.on('route:detailMessageView', function (msgID,folderID) {

      var detailMessageView = new DetailMessageView();
      detailMessageView.folderID = folderID;
      detailMessageView.msgID = msgID;

      detailMessageView.render();

      Shared.menuView.closeMenu();
  
    });

    app_router.on('route:composeMessageView', function (msgID,folderID) {

      var composeMessageView = new ComposeMessageView();

      composeMessageView.render();

      Shared.menuView.closeMenu();
  
    });

    app_router.on('route:settingsListView', function (secondViewName) {

      var settingsListView = new SettingsListView();
      settingsListView.secondViewName = secondViewName;
      settingsListView.render();

      Shared.menuView.selectMenu(5);
  
    });

    app_router.on('route:contactsListView', function (secondViewName) {

      contactsListView = new ContactsListView();
      contactsListView.secondViewName = secondViewName;
      contactsListView.render();

      Shared.menuView.selectMenu(3);
  
    });

    app_router.on('route:detailsContactView', function (secondViewName, contactID) {

      detailsContactView = new DetailsContactView();
      detailsContactView.secondViewName = secondViewName;
      detailsContactView.contactID = contactID;
      detailsContactView.render();

      Shared.menuView.selectMenu(3);
  
    });

    app_router.on('route:calendarListView', function (secondViewName) {

      var calendarListView = new CalendarListView();
      calendarListView.secondViewName = secondViewName;
      calendarListView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:chatListView', function (secondViewName) {

      var chatListView = new ChatListView();
      chatListView.secondViewName = secondViewName;
      chatListView.render();

      Shared.menuView.selectMenu(4);
  
    });

    app_router.on('route:contextMenuView', function () {

      Shared.menuView.context.toggleMenu();
  
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
