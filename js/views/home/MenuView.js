define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'backbone',
  'shared',
  'views/mail/FoldersMenuListView',
  'text!templates/home/menuTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, FoldersMenuListView, menuTemplate){

  var MenuView = Backbone.View.extend({
    el: $("#scrollerMenu"),

    menuOpen: false,

    render: function(){

      //UPDATE PROFILE
      var profile = JSON.parse(decodeURIComponent(Shared.api.read_cookie("profile")));
      Shared.profile = profile;

      var data = {
        user: Shared.profile,
        _: _ 
      };

      var compiledTemplate = _.template( menuTemplate, data );

      this.$el.html(compiledTemplate);

      var foldersMenuListView = new FoldersMenuListView();
      foldersMenuListView.render();

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

      this.loaded();

      Shared.scrollerRefresh();
    },

    closeMenu: function()
    {
      this.menuOpen = false;
      $('#menu').removeClass('expanded').removeAttr('style');
      $('#page').removeAttr('style');
    },

    loaded: function () 
    {
      Shared.scrollMenu = new iScroll('menu');
    }

  });

  return MenuView;
  
});