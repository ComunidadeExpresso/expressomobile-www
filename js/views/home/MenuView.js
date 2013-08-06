define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'backbone',
  'shared',
  'text!templates/home/menuTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, menuTemplate){

  var MenuView = Backbone.View.extend({
    el: $("#scrollerMenu"),

    menuOpen: false,

    render: function(){

      var data = {
        profile: Shared.profile,
        _: _ 
      };

      console.log(data);
      
      var compiledTemplate = _.template( menuTemplate, data );

      this.$el.html(compiledTemplate);

      this.loaded();

    },

    toggleMenu: function () {
      if (this.menuOpen) {
        console.log('closeMenu');
        this.closeMenu();
      } else {
        console.log('openMenu');
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
    },

    closeMenu: function()
    {
      this.menuOpen = false;
      $('#menu').removeClass('expanded').removeAttr('style');
      $('#page').removeAttr('style');
    },

    loaded: function () 
    {
      scrollMenu = new iScroll('menu');
    }

  });

  return MenuView;
  
});