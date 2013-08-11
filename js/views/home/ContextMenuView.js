define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'backbone',
  'shared',
  'text!templates/home/contextMenuTemplate.html'
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, contextMenuTemplate){

  var ContextMenuView = Backbone.View.extend({
    el: $("#contextMenu"),

    menuOpen: false,
    profile: null,
    collection: null,

    render: function(){

      var data = {
        menuItems: this.collection.models,
        _: _ 
      };

      var compiledTemplate = _.template( contextMenuTemplate, data );

      $('#contextMenuButton').addClass('contextMenu');

      $("#contextMenu").html(compiledTemplate);

    },

    hideMenu: function() {
      $("#contextMenuButton").removeClass("contextMenu");
      $("#contextMenu").html("");
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
      $('#contextMenu').removeClass('hidden');
    },

    closeMenu: function()
    {
      this.menuOpen = false;
      $('#contextMenu').addClass('hidden');
    },

    loaded: function () 
    {

    }

  });

  return ContextMenuView;
  
});