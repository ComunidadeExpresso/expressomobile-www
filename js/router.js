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
  'views/mail/EditFolderView',
  'views/settings/SettingsListView',
  'views/contacts/ContactsListView',
  'views/contacts/DetailsContactView',
  'views/contacts/AddContactView',
  'views/contacts/DeleteContactView',
  'views/calendar/CalendarListView',
  'views/calendar/CalendarDetailsView',
  'views/calendar/CalendarEditEventView',
  'views/calendar/CalendarDeleteEventView',
  'views/calendar/CalendarFullDayListView',
  'views/chat/ChatListView',
], function($, _, Backbone, Shared, LoginView, HomeView, DetailMessageView, ComposeMessageView, EditFolderView, SettingsListView,ContactsListView,DetailsContactView, AddContactView, DeleteContactView,CalendarListView,CalendarDetailsView, CalendarEditEventView, CalendarDeleteEventView, CalendarFullDayListView, ChatListView) {
  
  var AppRouter = Backbone.Router.extend({

    routes: {

      'Home' : 'homeView',
      'Login' : 'loginView',
      'Mail/AddFolder/*PfolderID' : 'newFolderView',
      'Mail/RenameFolder/*PfolderID' : 'renameFolderView',
      'Mail/DeleteFolder/*PfolderID' : 'deleteFolderView',
      'Mail/Message/:secondViewName/:msgID/*folderID' : 'composeMessageView',
      'Mail/Message/:secondViewName/:emailTo' : 'composeMessageTo',
      'Mail/Message/:secondViewName' : 'composeMessageView',
      'Mail/Messages/:forceReload/:msgID/*folderID' : 'detailMessageView',
      'Contacts' : 'contactsListView',
      'Contacts/Add/:contactID' : 'addContactView',
      'Contacts/Delete/:contactID' : 'deleteContactView',
      'Contacts/:secondViewName/OK' : 'deleteContactsListView',
      'Contacts/:secondViewName/:contactID/:status' : 'detailsContactView',
      'Contacts/:secondViewName/:contactID' : 'detailsContactView',
      'Contacts/:secondViewName' : 'contactsListView',
      'Calendar/FullDay/:year/:month/:day' : 'calendarFullDayView',
      'Calendar/Events/Add/:year/:month/:day' : 'calendarAddEventView',
      'Calendar/Events/Edit/:eventID' : 'calendarEditEventView',
      'Calendar/Events/Delete/:eventID/:year/:month/:day' : 'calendarDeleteEventView',
      'Calendar/Events/:eventID/:status' : 'calendarDetailsView',
      'Calendar/Events/:eventID' : 'calendarDetailsView',
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

    app_router.on('route:newFolderView', function (PfolderID) {

      if (PfolderID == undefined) {
        PfolderID = "INBOX";
      }

      PfolderID = PfolderID.replace("#","");

      var editFolderView = new EditFolderView();
      editFolderView.action = "addFolder";
      editFolderView.parentFolderID = PfolderID;
      editFolderView.render();

      Shared.menuView.closeMenu();

    });

    app_router.on('route:renameFolderView', function (PfolderID) {

      if (PfolderID == undefined) {
        PfolderID = "INBOX";
      }

      PfolderID = PfolderID.replace("#","");

      var editFolderView = new EditFolderView();
      editFolderView.action = "renameFolder";
      editFolderView.folderID = PfolderID;
      editFolderView.render();

      Shared.menuView.closeMenu();

    });

    app_router.on('route:deleteFolderView', function (PfolderID) {

      PfolderID = PfolderID.replace("#","");

      var editFolderView = new EditFolderView();
      editFolderView.deleteFolder(PfolderID);

      Shared.menuView.closeMenu();

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

      if ((Shared.api.auth()) || (Shared.gotoRoute != false)) {
        app_router.navigate("Home",{ trigger: true });
      } else {
        app_router.navigate("Login",{ trigger: true });
      }

    });

    app_router.on('route:detailMessageView', function (PforceReload,PmsgID,PfolderID) {

      PfolderID = PfolderID.replace("#","");

      var homeView = new HomeView({folderID: PfolderID});
      Shared.menuView.closeMenu();
      homeView.loadMessagesInFolder(PfolderID,'',PmsgID,PforceReload);

      if (PfolderID == 'INBOX') {
        Shared.menuView.selectMenu(1);
      } else {
        Shared.menuView.selectMenu(0);
      }

      Shared.deviceType(Shared.isSmartPhoneResolution());

/*
      var detailMessageView = new DetailMessageView();
      detailMessageView.folderID = folderID;
      detailMessageView.msgID = msgID;

      detailMessageView.render();

      Shared.menuView.closeMenu();

      Shared.deviceType(Shared.isSmartPhoneResolution()); 
*/
  
    });

    app_router.on('route:composeMessageView', function (secondViewName,msgID,folderID) {

      var composeMessageView = new ComposeMessageView();
      composeMessageView.secondViewName = secondViewName;
      composeMessageView.msgID = msgID;
      composeMessageView.folderID = folderID;
      composeMessageView.render();
      Shared.menuView.closeMenu();

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:composeMessageTo', function (secondViewName, emailTo) {

      var composeMessageView = new ComposeMessageView();
      composeMessageView.secondViewName = secondViewName;
      composeMessageView.emailTo = emailTo;
      composeMessageView.render();
      Shared.menuView.closeMenu();

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:settingsListView', function (secondViewName) {

      var settingsListView = new SettingsListView();
      settingsListView.secondViewName = secondViewName;
      settingsListView.render();

      Shared.menuView.selectMenu(5);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:contactsListView', function (secondViewName) {

      contactsListView = new ContactsListView();
      contactsListView.secondViewName = secondViewName;
      contactsListView.render();

      Shared.menuView.selectMenu(3);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:deleteContactsListView', function (secondViewName) {

      contactsListView = new ContactsListView();
      contactsListView.secondViewName = secondViewName;
      contactsListView.status = 'OK';
      contactsListView.render();

      Shared.menuView.selectMenu(3);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:detailsContactView', function (secondViewName, contactID, status) {

      detailsContactView = new DetailsContactView();
      detailsContactView.secondViewName = secondViewName;
      detailsContactView.contactID = contactID;
      detailsContactView.status = status;
      detailsContactView.render();

      Shared.menuView.selectMenu(3);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:addContactView', function (contactID, email) {

      addContactView = new AddContactView();
      addContactView.contactID = contactID;
      addContactView.email = email;
      addContactView.render();

      Shared.menuView.selectMenu(3);

      Shared.deviceType(Shared.isSmartPhoneResolution());
    });

    app_router.on('route:deleteContactView', function (contactID) {

      deleteContactView = new DeleteContactView();
      deleteContactView.contactID = contactID;
      deleteContactView.render();

      Shared.menuView.selectMenu(3);

      Shared.deviceType(Shared.isSmartPhoneResolution());
    });

    app_router.on('route:calendarListView', function (year, month, day, status) {

      var calendarListView = new CalendarListView();
      calendarListView.year = year;
      calendarListView.month = month;
      calendarListView.day = day;
      calendarListView.fullDay = false;
      calendarListView.status = status;
      calendarListView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:calendarFullDayView', function (year, month, day) {

      var calendarFullDayListView = new CalendarFullDayListView();
      calendarFullDayListView.year = year;
      calendarFullDayListView.month = month;
      calendarFullDayListView.day = day;
      calendarFullDayListView.fullDay = true;
      
      calendarFullDayListView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:calendarDetailsView', function (eventID, status) {

      var calendarDetailsView = new CalendarDetailsView();
      calendarDetailsView.eventID = eventID;
      calendarDetailsView.status = status;
      calendarDetailsView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:calendarEditEventView', function (eventID) {

      var calendarEditEventView = new CalendarEditEventView();
      calendarEditEventView.eventID = eventID;
      calendarEditEventView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:calendarAddEventView', function (year, month, day) {

      var calendarAddEventView = new CalendarEditEventView({year: year, month: month, day: day});
          // calendarAddEventView.year = year;
          // calendarAddEventView.month = month;
          // calendarAddEventView.day = day;
          // calendarAddEventView.listParticipants = [];
          calendarAddEventView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
  
    });

    app_router.on('route:calendarDeleteEventView', function (eventID, year, month, day) {

      var calendarDeleteEventView = new CalendarDeleteEventView();
      calendarDeleteEventView.eventID = eventID;
      calendarDeleteEventView.year = year;
      calendarDeleteEventView.month = month;
      calendarDeleteEventView.day = day;
      calendarDeleteEventView.render();

      Shared.menuView.selectMenu(2);

      Shared.deviceType(Shared.isSmartPhoneResolution());
    });

    app_router.on('route:chatListView', function (secondViewName) {

      var chatListView = new ChatListView();
      chatListView.secondViewName = secondViewName;
      chatListView.render();

      Shared.menuView.selectMenu(4);
      Shared.deviceType(Shared.isSmartPhoneResolution());
  
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
