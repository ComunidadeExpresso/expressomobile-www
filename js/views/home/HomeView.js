define([
  'jquery',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'views/mail/MessagesView',
  'views/mail/DetailMessageView',
  'views/home/MenuView',
  'text!templates/home/homeTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, MessagesCollection, MessagesView, DetailMessageView, MenuView, homeTemplate){

  var HomeView = Backbone.View.extend({
    el: $("#mainAppPageContent"),

    folderID: 'INBOX',
    msgID: '',
    search: '',
    page: 1,

    menuView: null,
    menuOpen: false,

    initialize:function() {
      $(window).on("resize",this.refreshWindow);
      
      //CARREGA A VIEW DO MENU
      var mView = new MenuView();
      this.menuView = mView;
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
      this.menuView.render();

      var messagesData = new MessagesCollection();

      messagesData.getMessagesInFolder(this.folderID,'',this.search,this.page).done(function(data){

        var firstMessage = data.models[0];
        
        Shared.router.navigate(firstMessage.route(),{trigger: true});

        var messagesView = new MessagesView({ el: $("#scrollerList"), collection: data });
        messagesView.render();

        $("#" + firstMessage.listItemID()).addClass("selected");

        that.loaded();

      })
      .fail(function(result){
        if (result.error.code == 7) {
          Shared.router.navigate('Login',{trigger: true});
          alert("Sua sessão expirou.");
        }
        
        return false;
      })
      .execute();
      

    },

    events: {
      "click #menuButton": "toggleMenu"
    },

    toggleMenu: function() {
      this.menuView.toggleMenu();
      /*console.log("toggleMenu");
      if (this.menuOpen) {
        console.log('closeMenu');
        this.menuOpen = false;
        this.menuView.closeMenu();
      } else {
        console.log('openMenu');
        this.menuOpen = true;
        this.menuView.openMenu();
      } */
    },

    refreshWindow: function() {
      console.log('refreshWindow()');
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

    pullDownAction: function () 
    {
      console.log('pullDownAction');
    },

    pullUpAction : function() 
    {
      console.log('pullUpAction');
       page = page + 1;
    },

    loaded: function () 
    {
        console.log('loaded()');

        var top = $('.top').outerHeight(true);
        var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
        
        // Verify screen width to define device type
        this.deviceType($(window).width() < 720);

        Shared.refreshDotDotDot();

        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);

        pullDownEl = document.getElementById('pullDown');
        pullDownOffset = pullDownEl.offsetHeight;
        pullUpEl = document.getElementById('pullUp'); 
        pullUpOffset = pullUpEl.offsetHeight;

        var that = this;
        Shared.scrollDetail = new iScroll('wrapperDetail');
        Shared.scroll = new iScroll('wrapper',
        {
          useTransition: true,
          topOffset: pullDownOffset,
          onRefresh: function () 
          {
            if (pullDownEl.className.match('loading')) 
            {
              pullDownEl.className = '';
              pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
            }
            else if (pullUpEl.className.match('loading')) 
            {
              pullUpEl.className = '';
              pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
            }
          },
          onScrollMove: function () 
          {
            if (this.y > 5 && !pullDownEl.className.match('flip')) 
            {
              pullDownEl.className = 'flip';
              pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Solte para atualizar...';
              this.minScrollY = 0;
            } 
            else if (this.y < 5 && pullDownEl.className.match('flip')) 
            {
              pullDownEl.className = '';
              pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
              this.minScrollY = -pullDownOffset;
            } 
            else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) 
            {
              pullUpEl.className = 'flip';
              pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Solte para carregar mais...';
              this.maxScrollY = this.maxScrollY;
            } 
            else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) 
            {
              pullUpEl.className = '';
              pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
              this.maxScrollY = pullUpOffset;
            }
          },
          onScrollEnd: function () 
          {
            if (pullDownEl.className.match('flip')) 
            {
              pullDownEl.className = 'loading';
              pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Carregando...';
              that.pullDownAction(); 
            }
            else if (pullUpEl.className.match('flip')) 
            {
              pullUpEl.className = 'loading';
              pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Carregando...';
              that.pullUpAction(); 
            }
          } 
        });



        //scrollMenu = new iScroll('menu');
    }

  });

  return HomeView;
  
});
