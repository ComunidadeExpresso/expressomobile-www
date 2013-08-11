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
      
      this.menuView = new MenuView( { el : $("#scrollerMenu") });
      this.menuView.profile = this.profile;
      this.menuView.render();
     
      this.menuView.selectMenu(1);
      this.loadMessagesInFolder(this.folderID,this.search);

      this.loaded();
      
    },

    loadMessagesInFolder: function(Pfolder,Psearch) {
      var messagesListView = new MessagesListView({ el: $("#content") , folderID: Pfolder, search: Psearch, page: this.page });
      messagesListView.folderID = Pfolder;
      messagesListView.render();
    },

    events: {
      "click #menuButton": "toggleMenu",
      "click #contextMenuButton": "toggleContextMenu",
      "click .listFolderItemLink": "selectFolderItem",
      "click .menuLink": "selectMenuItem"
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
      var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
      
      // Verify screen width to define device type
      //deviceType($(window).width() < 720);
      if ($(window).width() < 720) 
        $('body').addClass('smartphone');
      else 
        $('body').removeAttr('class');

      $('body').height($(window).height() - top);
      $('#wrapper').css('top', top + search);

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

        console.log('loaded()');

        var top = $('.top').outerHeight(true);
        var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
        
        // Verify screen width to define device type
        //alert($(window).width());
        this.deviceType($(window).width() < 720);

        Shared.refreshDotDotDot();

        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);

        
        //Shared.scrollDetail = new iScroll('wrapperDetail');
        
    }

  });

  return HomeView;
  
});
