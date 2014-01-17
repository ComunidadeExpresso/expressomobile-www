define([
  'underscore', 
  'backbone', 
  'shared',
  'models/home/MenuItemModel',
  ], function(_, Backbone,Shared, MenuItemModel){
	  
  var MenuItemsCollection = Backbone.Collection.extend({

    model: MenuItemModel,

    _data: {},

    initialize : function(models, options) {

    },


    getInboxMenuItem: function() {
        var menuItem = {menuTitle: "Caixa de Entrada",
                        menuRoute: "/Mail/Messages/1/0/INBOX#",
                        menuClass: "inbox",
                        menuIconClass: "icon-email",
                        menuHasBadge: true};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getCalendarMenuItem: function() {
        var menuItem = {menuTitle: "Agenda",
                        menuRoute: "/Calendar",
                        menuClass: "calendar",
                        menuIconClass: "icon-agenda"};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getContactsMenuItem: function() {
        var menuItem = {menuTitle: "Contatos",
                        menuRoute: "/Contacts/Personal",
                        menuClass: "contacts",
                        menuIconClass: "icon-contacts"};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getChatMenuItem: function() {
        var menuItem = {menuTitle: "Chat",
                        menuRoute: "/Chat",
                        menuClass: "chat",
                        menuIconClass: "icon-jabber",
                        menuHasBadge: true};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getSettingsMenuItem: function() {
        var menuItem = {menuTitle: "Prefer&ecirc;ncias",
                        menuRoute: "/Settings",
                        menuClass: "settings",
                        menuIconClass: "icon-settings"};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getLogoutMenuItem: function() {
        var menuItem = {menuTitle: "Sair",
                        menuRoute: "/Logout",
                        menuClass: "logout",
                        menuIconClass: "icon-logout"};
        var model = new MenuItemModel(menuItem);
        return model;
    },

    getMenuItems: function(modules) {

      if (Shared.userHasModule("mail")) {
        this.add(this.getInboxMenuItem());
      }
      if (Shared.userHasModule("calendar")) {
        this.add(this.getCalendarMenuItem());
      }
      if (Shared.userHasModule("catalog")) {
        this.add(this.getContactsMenuItem());
      }
      if (Shared.userHasModule("chat")) {
        this.add(this.getChatMenuItem());
      }
      if (Shared.userHasModule("settings")) {
        this.add(this.getSettingsMenuItem());
      }
      this.add(this.getLogoutMenuItem());

      return this.models;

    },

  });
  return MenuItemsCollection;
});
