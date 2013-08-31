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
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, FoldersMenuListView, menuTemplate,ContextMenuView,ContextMenuCollection){

  var MenuView = Backbone.View.extend({
    el: $("#scrollerMenu"),

    menuOpen: false,
    profile: null,
    context: null,

    initialize:function() {
      this.context = new ContextMenuView();
    },

    render: function(){

      if (_.isNull(this.profile)) {


        console.log('renderMenu');
        //UPDATE PROFILE
        //GERALMENTE O PROFILE É ENVIAOD PELO MENU-VIEW PORÉM SE O USUÁRIO REALIZAR O RELOAD DA PÁGINA
        //ENTÃO SERÁ NECESSÁRIO RECARREGÁ-LO DO LOCALSTORAGE

        var expressoValue = Shared.api.getLocalStorageValue("expresso");

        if (expressoValue != null) {

          var authValue = expressoValue.auth;

          if (authValue != null) {
            Shared.api.auth(authValue);
          }

          Shared.profile = expressoValue.profile;
          this.profile = Shared.profile;

        }

      }

      var data = {
        user: this.profile,
        _: _ 
      };

      var compiledTemplate = _.template( menuTemplate, data );

      this.$el.html(compiledTemplate);


      Shared.api
      .resource('Catalog/ContactPicture')
      .params({contactID:this.profile.contactID,contactType:'2'})
      .done(function(result){
        $("#userPicture").attr("src","data:image/gif;base64," + result.contacts[0].contactImagePicture);
      })
      .execute();

      this.context = new ContextMenuView();

      var foldersMenuListView = new FoldersMenuListView();
      foldersMenuListView.render();

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
          this.context.collection = contextMenuCollection.getSendMessageMenu();
      }
      if (menuID == 'newMessageWithCc') {
          this.context.collection = contextMenuCollection.getSendMessageMenuWithCC();
      }
      if (menuID == 3) {
          this.context.collection = contextMenuCollection.getContactsMenu();
      }
      this.context.render();
    },

  });

  return MenuView;
  
});