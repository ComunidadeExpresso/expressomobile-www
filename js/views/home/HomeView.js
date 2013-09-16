define([
  'jquery',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'views/mail/MessagesListView',
  'views/mail/DetailMessageView',
  'views/home/MenuView',
  'text!templates/home/homeTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, MessagesCollection, MessagesListView, DetailMessageView, MenuView, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#mainAppPageContent"),

    folderID: 'INBOX',
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

    },

    remove: function() {
      $(window).off("resize",this.refreshWindow);
      //call the superclass remove method
      Backbone.View.prototype.remove.apply(this, arguments);
    },

    render: function(){
      
      this.$el.html(homeTemplate);

      var that = this;


      var expressoValue = Shared.api.getLocalStorageValue("expresso");

      if (expressoValue != null) {

        var userName = expressoValue.username;
        var passwd = expressoValue.password;

        Shared.im
        .username(userName)
        .password(passwd)
        .connect();

        Shared.api.phoneGap(expressoValue.phoneGap);

        if (expressoValue.phoneGap) {
          Shared.api.context(expressoValue.serverAPI).crossdomain(expressoValue.serverAPI);
        } else {
          Shared.api.context("/api/").crossdomain(expressoValue.serverAPI);
        }

      }

      
      this.menuView = new MenuView( { el : $("#scrollerMenu") });
      this.menuView.profile = this.profile;
      this.menuView.render();
     
      this.menuView.selectMenu(1);
      this.loadMessagesInFolder(this.folderID,this.search);

      this.loaded();

      Shared.setDefaultIMListeners();

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
      
    },

    loadMessagesInFolder: function(Pfolder,Psearch) {
      var messagesListView = new MessagesListView({ folderID: Pfolder, search: Psearch, page: this.page });
      messagesListView.folderID = Pfolder;
      messagesListView.render();
    },

    events: {
      "click #menuButton": "toggleMenu",
      "click .listFolderItemLink": "selectFolderItem",
      "click .menuLink": "selectMenuItem",
      "click .listItemLink": "selectListItem",
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
      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
    },

    toggleMenu: function() {
      this.menuView.toggleMenu();
    },

    toggleContextMenu: function() {
      this.menuView.context.toggleMenu();
    },

    refreshWindow: function() {
      //alert('refreshWindow()');


      var top = $('.top').outerHeight(true);
      var chat = $('.chatArea').outerHeight(true) == null ? 0 : $('.chatArea').outerHeight(true);

      var search = $('#content .searchArea').outerHeight(true) == null ? 0 : $('#content .searchArea').outerHeight(true);
      var searchDetail = $('#contentDetail .searchArea').outerHeight(true) == null ? 0 : $('#contentDetail .searchArea').outerHeight(true);
      
      // Verify screen width to define device type
      if (Shared.isSmartPhoneResolution())
        $('body').addClass('smartphone');
      else 
        $('body').removeAttr('class');

      $('body').height($(window).height() - top);
      $('#wrapper').css('top', top + search);
      $('#wrapperDetail').css('top', top + chat + searchDetail);

      Shared.scrollerRefresh();
      Shared.refreshDotDotDot();
    },

    // Define device type
    deviceType: function(smartphone)
    {
      if (smartphone)
        $('body').addClass('smartphone');
      else 
        $('body').removeAttr('class');
    },

    loaded: function () 
    {

        var top = $('.top').outerHeight(true);

        var search = $('#content .searchArea').outerHeight(true) == null ? 0 : $('#content .searchArea').outerHeight(true);
        
        // Verify screen width to define device type
        this.deviceType(Shared.isSmartPhoneResolution());

        Shared.refreshDotDotDot();

        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);

        
        //Shared.scrollDetail = new iScroll('wrapperDetail');
        
    }

  });

  return HomeView;
  
});
