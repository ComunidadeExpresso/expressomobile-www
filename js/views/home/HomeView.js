define([
  'jquery',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'collections/home/ServersCollection',
  'views/mail/MessagesListView',
  'views/mail/DetailMessageView',
  'views/home/MenuView',
  'text!templates/home/homeTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, MessagesCollection, ServersCollection, MessagesListView, DetailMessageView, MenuView, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#mainAppPageContent"),

    folderID: 'INBOX',
    msgID: '0',
    search: '',
    page: '1',
    profile: null,

    menuView: null,
    menuOpen: false,

    initialize:function() {
      $(window).on("resize",this.refreshWindow);
      
      //CARREGA A VIEW DO MENU
      var mView = new MenuView();
      this.menuView = mView;

      //SALVA A VIEW DO MENU NO SHARED
      Shared.menuView = mView;

      // 

    },

    remove: function() {
      $(window).off("resize",this.refreshWindow);
      //call the superclass remove method
      Backbone.View.prototype.remove.apply(this, arguments);
    },

    render: function(){
      
      this.$el.html(homeTemplate);

      var that = this;

      Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

        if (expressoValue != null) {

          Shared.profile = expressoValue.profile;

          var userName = expressoValue.username;
          var passwd = expressoValue.password;

          if (Shared.userHasModule("chat")) {
            Shared.im
            .username(userName)
            .password(passwd)
            .connect();
          }

          Shared.api.phoneGap(expressoValue.phoneGap);

          if (expressoValue.phoneGap) {
            Shared.api.context(expressoValue.serverAPI).crossdomain(expressoValue.serverAPI);
          } else {
            Shared.api.context(Shared.context).crossdomain(expressoValue.serverAPI);
          }

        }

        
        that.menuView = new MenuView( { el : $("#scrollerMenu") });
        that.menuView.profile = that.profile;
        that.menuView.render();
       
        Shared.setDefaultIMListeners();

        
         if (Shared.gotoRoute == false) {
          if (!Shared.newMessageIntent) {


            if (Shared.userHasModule("mail")) {
              that.menuView.selectMenu(1);
              that.loadMessagesInFolder(that.folderID,that.search,'','1');
              that.loaded();

            } else {

              if (Shared.userHasModule("calendar")) {
                that.menuView.selectMenu(2);
                Shared.router.navigate("/Calendar",{ trigger: true });
              } else {
                if (Shared.userHasModule("catalog")) {
                  that.menuView.selectMenu(3);
                  Shared.router.navigate("/Catalog",{ trigger: true });
                } else {
                  if (Shared.userHasModule("chat")) {
                    that.menuView.selectMenu(4);
                    Shared.router.navigate("/Chat",{ trigger: true });
                  }
                }
              } 
            }

          } else {

            that.loaded();
            
            Shared.newMessageIntent = false;
            Shared.router.navigate("/Mail/Message/New",{ trigger: true });
          }

        } else {

          console.log("gotoRoute: " + Shared.gotoRoute);

          Shared.router.navigate(Shared.gotoRoute,{ trigger: true });

          Shared.gotoRoute = false;

          that.loaded();
        }

        $('#page').touchwipe(
        {
          wipeLeft: function() 
          {
            that.menuView.closeMenu();
            Shared.scrollerRefresh();
          },
          wipeRight: function() 
          {
            that.menuView.openMenu();
            Shared.scrollerRefresh();
          },
          preventDefaultEvents: true
        });

      });
      
    },

    loadMessagesInFolder: function(Pfolder,Psearch,PmsgID,PforceReload) {

      this.msgID = PmsgID;

      var messagesListView = new MessagesListView({ folderID: Pfolder, search: Psearch, page: this.page, msgID: PmsgID });
      messagesListView.folderID = Pfolder;
      messagesListView.msgID = PmsgID;
      messagesListView.forceReload = PforceReload;
      messagesListView.render();
      
    },

    events: {
      "click #menuButton": "toggleMenu",
      "click .listFolderItemLink": "selectFolderItem",
      "click .menuLink": "selectMenuItem",
      "click .listItemLink": "selectListItem",
      "click body": 'clickMainAppPageContent',
    },


	selectListItem: function(e){

      e.preventDefault();

      $('#scrollerList li').each(function() { 
          $(this).removeClass( 'selected' ); 
      }); 

      var parent = $(e.target).parent();

      if (parent.hasClass("listItemLink")) {
        parent = parent.parent();
      }

      parent.addClass("selected");

      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    },

    selectMenuItem: function(e){
      e.preventDefault();
      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
    },

    selectFolderItem: function(e){
      e.preventDefault();
      console.log("selectFolderItem");
      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
    },

    toggleMenu: function(e) {
      if (e != undefined) {
        e.preventDefault();
      }
      this.menuView.toggleMenu();
    },

    toggleContextMenu: function() {
      this.menuView.context.toggleMenu();
    },


    refreshWindow: function() {

      var that = this;

      var doneResizing = function() {
        var top = $('.topHeader').outerHeight(true);
        var chat = $('.chatArea').outerHeight(true) == null ? 0 : $('.chatArea').outerHeight(true);

        var search = $('#content .searchArea').outerHeight(true) == null ? 0 : $('#content .searchArea').outerHeight(true);
        var searchDetail = $('#contentDetail .searchArea').outerHeight(true) == null ? 0 : $('#contentDetail .searchArea').outerHeight(true);
        
        if (Shared.forceSmartPhoneResolution == false) {
          if (Shared.isSmartPhoneResolution()) {
            Shared.forceSmartPhoneResolution = true;
          }
        }

        Shared.deviceType(Shared.forceSmartPhoneResolution);

        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);
        $('#wrapperDetail').css('top', top + chat + searchDetail);

        Shared.scrollerRefresh();
        Shared.refreshDotDotDot();
      }

      clearTimeout(this.idResize);
      this.idResize = setTimeout(doneResizing, 500);
    },

    loaded: function () 
    {
      
      if (Shared.gotoRoute != false) {
        
        Shared.router.navigate(Shared.gotoRoute,{ trigger: true });
        Shared.gotoRoute = false;
      }

      var top = $('.topHeader').outerHeight(true);

      if (!Shared.isAndroid() && Shared.isPhonegap()) {
        top = top + 20;
      }

      var search = $('#content .searchArea').outerHeight(true) == null ? 0 : $('#content .searchArea').outerHeight(true);

      var isSmartPhoneResolution = ($(window).width() < 720);
      if (isSmartPhoneResolution) {
        Shared.forceSmartPhoneResolution = true;
      }
      
      // Verify screen width to define device type
      Shared.deviceType(Shared.forceSmartPhoneResolution);

      Shared.refreshDotDotDot();

      $('body').height($(window).height() - top);
      $('#wrapper').css('top', top + search);
      
    }

  });

  return HomeView;
  
});
