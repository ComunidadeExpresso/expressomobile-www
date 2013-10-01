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
  'views/calendar/CalendarDetailsView',
  'views/calendar/CalendarEditEventView',
  'views/calendar/CalendarDeleteEventView',
  'views/calendar/CalendarFullDayListView',
  'views/chat/ChatListView',
], function($, _, Backbone, Shared, LoginView, HomeView, DetailMessageView, ComposeMessageView, SettingsListView,ContactsListView,DetailsContactView,CalendarListView,CalendarDetailsView, CalendarEditEventView, CalendarDeleteEventView, CalendarFullDayListView, ChatListView) {
  
  var AppRouter = Backbone.Router.extend({

    routes: {

      'Home' : 'homeView',
      'Login' : 'loginView',
      'Mail/Folders/*folderID' : 'openFolderView',
      'Mail/Message/:secondViewName/:msgID/*folderID' : 'composeMessageView',
      'Mail/Message/:secondViewName/:emailTo' : 'composeMessageView',
      'Mail/Message/:secondViewName' : 'composeMessageView',
      'Mail/Message/:secondViewName/:msgID/*folderID' : 'composeMessageView',
      'Mail/Messages/:msgID/*folderID' : 'detailMessageView',
      'Contacts' : 'contactsListView',
      'Contacts/:secondViewName' : 'contactsListView',
      'Contacts/:secondViewName/:contactID' : 'detailsContactView',
      'Calendar/FullDay/:year/:month/:day' : 'calendarFullDayView',
      'Calendar/Events/Add/:year/:month/:day' : 'calendarAddEventView',
      'Calendar/Events/Edit/:eventID' : 'calendarEditEventView',
      'Calendar/Events/Delete/:eventID/:year/:month/:day' : 'calendarDeleteEventView',
      'Calendar/Events/:eventID' : 'calendarDetailsView',
      'Calendar/Events/:eventID/:status' : 'calendarDetailsView',
      'Calendar/:year/:month/:day/:status' : 'calendarListView',
      'Calendar/:year/:month/:day' : 'calendarListView',
      'Calendar' : 'calendarListView',
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

      if (!Shared.newMessageIntent) {
        var homeView = new HomeView({folderID: PfolderID});
        Shared.menuView.closeMenu();
        homeView.loadMessagesInFolder(PfolderID,'');

        if (PfolderID == 'INBOX') {
          Shared.menuView.selectMenu(1);
        } else {
          Shared.menuView.selectMenu(0);
        }
      } else {
        Shared.newMessageIntent = false;
        Shared.router.navigate("/Mail/Message/New",{ trigger: true });
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

      Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

        if (expressoValue != null) {

          var authValue = expressoValue.auth;

          if (authValue != null) {
            Shared.api.auth(authValue);
          }

          Shared.profile = expressoValue.profile;

        }

      });

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

    app_router.on('route:composeMessageView', function (secondViewName,msgID,folderID) {

      var composeMessageView = new ComposeMessageView();
      composeMessageView.secondViewName = secondViewName;
      composeMessageView.msgID = msgID;
      composeMessageView.folderID = folderID;
      composeMessageView.render();
      Shared.menuView.closeMenu();
  
    });

    app_router.on('route:composeMessageView', function (secondViewName, emailTo) {

      var composeMessageView = new ComposeMessageView();
      composeMessageView.secondViewName = secondViewName;
      composeMessageView.emailTo = emailTo;
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

    app_router.on('route:calendarListView', function (year, month, day, status) {

      var calendarListView = new CalendarListView({el: $('#content')});
      calendarListView.year = year;
      calendarListView.month = month;
      calendarListView.day = day;
      calendarListView.fullDay = false;
      calendarListView.status = status;
      calendarListView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:calendarFullDayView', function (year, month, day) {

      var calendarFullDayListView = new CalendarFullDayListView();
      calendarFullDayListView.year = year;
      calendarFullDayListView.month = month;
      calendarFullDayListView.day = day;
      calendarFullDayListView.fullDay = true;
      
      calendarFullDayListView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:calendarDetailsView', function (eventID, status) {

      var calendarDetailsView = new CalendarDetailsView();
      calendarDetailsView.eventID = eventID;
      calendarDetailsView.status = status;
      calendarDetailsView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:calendarEditEventView', function (eventID) {

      var calendarEditEventView = new CalendarEditEventView();
      calendarEditEventView.eventID = eventID;
      calendarEditEventView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:calendarAddEventView', function (year, month, day) {

      var calendarAddEventView = new CalendarEditEventView({year: year, month: month, day: day});
          // calendarAddEventView.year = year;
          // calendarAddEventView.month = month;
          // calendarAddEventView.day = day;
          // calendarAddEventView.listParticipants = [];
          calendarAddEventView.render();

      Shared.menuView.selectMenu(2);
  
    });

    app_router.on('route:calendarDeleteEventView', function (eventID, year, month, day) {

      var calendarDeleteEventView = new CalendarDeleteEventView();
      calendarDeleteEventView.eventID = eventID;
      calendarDeleteEventView.year = year;
      calendarDeleteEventView.month = month;
      calendarDeleteEventView.day = day;
      calendarDeleteEventView.render();

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
