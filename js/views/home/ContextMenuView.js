define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'jquery_dotdotdot',
  'backbone',
  'shared',
  'text!templates/home/contextMenuTemplate.html',
  'collections/home/ContextMenuCollection',
], function($, _, iscroll, touchWipe, dotdotdot, Backbone, Shared, contextMenuTemplate,ContextMenuCollection){

  var ContextMenuView = Backbone.View.extend({
    el: $("#rightMenu"),

    menuOpen: false,
    profile: null,
    collection: null,
    primaryAction: '',

    render: function(){

      var data = {
        menuItems: this.collection.models,
        _: _ 
      };

      var compiledTemplate = _.template( contextMenuTemplate, data );

      $('#contextMenuButton').addClass('contextMenu');

      this.$el.html(compiledTemplate);

      this.setPrimaryAction();

    },

    initialize : function ( options ) {

      // `on()` or `bind()`
      //$("#btn-primary-action").click(this.routeToPrimaryAction);

      //this.on( 'click #btn-primary-action', this.routeToPrimaryAction, this );

    },

    events: {
      "click #contextMenuButton": "toggleMenu",
      "click #btn-primary-action": "routeToPrimaryAction",
    },

    routeToPrimaryAction: function(e){

      console.log("routeToPrimaryAction");
      console.log(this.primaryAction);

      e.preventDefault();

      this.undelegateEvents();

      if (this.primaryAction != '') {
        Shared.router.navigate(this.primaryAction,{trigger: true});
      } 

    },

    

    setPrimaryAction: function() {
      var primary = this.collection.getPrimaryAction();
      if (primary) {
        this.primaryAction = primary.get("route");
        $("#btn-primary-action").removeAttr("class");
        if (primary.get("iconClass") != '') {
          $("#btn-primary-action").attr('class', 'btn btn-context ' + primary.get("iconClass"));
          $("#btn-primary-action").val("");
        } else {
          $("#btn-primary-action").attr('class', 'btn btn-primary btn-context');
          $("#btn-primary-action").val(primary.get("title"));
        }
        
      } else {
        $("#btn-primary-action").removeAttr("class");
        $("#btn-primary-action").attr('class', 'hidden');
      }
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

  });

  return ContextMenuView;
  
});