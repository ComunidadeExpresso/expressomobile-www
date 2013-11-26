define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'backbone',
  'shared',
  'views/mail/FoldersMenuListView',
  'text!templates/home/menuTemplate.html',
  'views/home/ContextMenuView',
  'collections/home/ContextMenuCollection',
  'collections/home/MenuItemsCollection',
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, FoldersMenuListView, menuTemplate,ContextMenuView,ContextMenuCollection,MenuItemsCollection){

  var MenuView = Backbone.View.extend({
    el: $("#scrollerMenu"),

    menuOpen: false,
    profile: null,
    context: null,
    folderMenuLV: null,

    initialize:function() {
      this.context = new ContextMenuView();
    },

    render: function(){


        //UPDATE PROFILE
        //GERALMENTE O PROFILE É ENVIAOD PELO MENU-VIEW PORÉM SE O USUÁRIO REALIZAR O RELOAD DA PÁGINA
        //ENTÃO SERÁ NECESSÁRIO RECARREGÁ-LO DO LOCALSTORAGE

        var that = this;
        Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

          if (expressoValue != null) {

            var authValue = expressoValue.auth;

            if (authValue != null) {
              Shared.api.auth(authValue);
            }

            Shared.profile = expressoValue.profile;
            that.profile = Shared.profile;

          }

          var menuItemsCollection = new MenuItemsCollection();

          var itemsMenu = menuItemsCollection.getMenuItems(Shared.profile.contactApps);


          var data = {
            user: that.profile,
            menuItems: itemsMenu, 
            _: _,
            Shared: Shared
          };

          var compiledTemplate = _.template( menuTemplate, data );

          that.$el.html(compiledTemplate);


          Shared.api
          .resource('Catalog/ContactPicture')
          .params({contactID:that.profile.contactID,contactType:'2'})
          .done(function(result){
            if (result.contacts[0].contactImagePicture != "") {
              $("#userPicture").css("background-image","url('data:image/gif;base64," + result.contacts[0].contactImagePicture + "')");
              $("#userPicture").css("background-size","46px 61px");
            } 
          })
          .fail(function(error) {
            Shared.handleErrors(error);
          })
          .execute();

          that.context = new ContextMenuView();

          if (Shared.userHasModule("mail")) {
            that.folderMenuLV = new FoldersMenuListView();
            that.folderMenuLV.render();

          }

        });

    },

    refreshFolders: function() {
      this.folderMenuLV = new FoldersMenuListView();
      this.folderMenuLV.render();
    }, 

    setQuota: function (used,total) {

      var percent = (used * 100 /  total).toFixed(0);

      $("#usedQuota").width(percent + "%");
      $("#textQuota").html(percent + "% (" + this.bytesToSize(used,0) + " / " + this.bytesToSize(total,0) + ")"  );

    },

    bytesToSize: function(bytes, precision)
    {  
        var kilobyte = 1024;
        var megabyte = kilobyte * 1024;
        var gigabyte = megabyte * 1024;
        var terabyte = gigabyte * 1024;
       
        if ((bytes >= 0) && (bytes < kilobyte)) {
            return bytes + ' B';
     
        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
            return (bytes / kilobyte).toFixed(precision) + ' KB';
     
        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
            return (bytes / megabyte).toFixed(precision) + ' MB';
     
        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
            return (bytes / gigabyte).toFixed(precision) + ' GB';
     
        } else if (bytes >= terabyte) {
            return (bytes / terabyte).toFixed(precision) + ' TB';
     
        } else {
            return bytes + ' B';
        }
    },

    selectMenu: function (index) {
      $('#mainMenu li').each(function() { 
        $(this).removeClass( 'selected' ); 
      });

      if (index == 1) {
         $('#mainMenu li.inbox').addClass("selected"); 
      }

      if (index == 2) {
         $('#mainMenu li.calendar').addClass("selected"); 
      }

      if (index == 3) {
         $('#mainMenu li.contacts').addClass("selected"); 
      }

      if (index == 4) {
         $('#mainMenu li.chat').addClass("selected"); 
      }

      if (index == 5) {
         $('#mainMenu li.settings').addClass("selected"); 
      }

      if (index == 6) {
         $('#mainMenu li.logout').addClass("selected"); 
      }

      this.closeMenu();

    },

    toggleMenu: function () {
      if (this.menuOpen) {
        this.closeMenu();
      } else {
        this.openMenu();
      }

      return false;
    },

    openMenu: function()
    {
      this.menuOpen = true;
      var winWidth = $(window).width();
      var menuButtonWidth = $('.top .menu').width();
      var propWidth = Math.ceil(winWidth * 30 / 100);
      var width =  300;

      if ((winWidth - menuButtonWidth) < width)
        width = winWidth - menuButtonWidth;
      else if (propWidth > width) 
        width = propWidth;

      $('#menu').addClass('expanded').css('width', width);
      $('#page').css('margin-left', width);

      if (Shared.scrollMenu == null) {
        this.loaded();
      }

      Shared.scrollerRefresh();
    },

    closeMenu: function()
    {
      this.menuOpen = false;
      $('#menu').removeClass('expanded').removeAttr('style');
      $('#page').removeAttr('style');
      $('#page').css('margin-left', '0');
    },

    loaded: function () 
    {
      if (Shared.scrollMenu != null) {
        Shared.scrollMenu.destroy();
        Shared.scrollMenu = null;
      }

      Shared.scrollMenu = new iScroll('menu');
    },

    setChatBadge: function(value) 
    {
      if (value > 0) {
        $("#badge_chat").removeClass("hidden");
        $("#badge_chat").html(value);
      } else {
        $("#badge_chat").addClass("hidden");
        $("#badge_chat").html(value);
      }
    },

    renderContextMenu: function(menuID,params) {

      this.context = new ContextMenuView();
      var contextMenuCollection = new ContextMenuCollection();
      if (menuID == 1) {
          this.context.collection = contextMenuCollection.getDetailMessageMenu(params.folderID,params.msgID);
      }
      if (menuID == 'messageList') { 
        this.context.collection = contextMenuCollection.getMessagesListMenu(params.folderID);
      }
      if (menuID == 'newMessage') {
          this.context.collection = contextMenuCollection.getSendMessageMenu(params);
      }
      if (menuID == 'newMessageWithCc') {
          this.context.collection = contextMenuCollection.getSendMessageMenuWithCC(params);
      }
      if (menuID == 'personalContacts') {
          this.context.collection = contextMenuCollection.getPersonalContactsMenu();
      }
      if (menuID == 'generalContacts') {
          this.context.collection = contextMenuCollection.getGeneralContactsMenu();
      }
      if (menuID == 'detailsContact') {
          this.context.collection = contextMenuCollection.getDetailsContactMenu(params.email);
      }
      if (menuID == 'calendar') {
          this.context.collection = contextMenuCollection.getCalendarMenu(params.year, params.month, params.day);
      }
      if (menuID == 'mailsignature') {
          this.context.collection = contextMenuCollection.getMailSignatureMenu();
      } 
      if (menuID == 'calendarAddEvent') {
          this.context.collection = contextMenuCollection.getCalendarAddEventMenu(params);
      }
      if (menuID == 'calendarAddEventParticipant') {
          this.context.collection = contextMenuCollection.getCalendarAddEventParticipantMenu(params);
      }
      if (menuID == 'calendarDetailsEvent') {
          this.context.collection = contextMenuCollection.getCalendarDetailsEventMenu(params.isOwner, params.eventID, params.year, params.month, params.day);
      }
      if (menuID == 'editFolder') {
          this.context.collection = contextMenuCollection.getEditFolderMenu(params);
      }
      this.context.render();
    },

  });

  return MenuView;
  
});