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

    menuOpen: false,
    profile: null,
    collection: null,
    primaryAction: '',

    render: function(){

      if (!this.collection) {
        this.collection = new ContextMenuCollection();
      }

      var data = {
        menuItems: this.collection.models,
        _: _ 
      };

      var compiledTemplate = _.template( contextMenuTemplate, data );

      $('#contextMenuButton').addClass('contextMenu');

      this.$el.html(compiledTemplate);

      $("#rightMenu").empty().append(this.$el);

      this.setPrimaryAction();

      if (this.collection.models.length == 0) {
        this.hideMenu();
      }

    },

    initialize : function ( options ) {


    },

    events: {
      "click #contextMenuButton": "toggleMenu",
      "click #btn-primary-action": "routeToPrimaryAction",
      "click #contextMenu ul li a": "selectContextMenuItem"
    },

    selectContextMenuItem: function(e){
      e.preventDefault();

      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
      
      this.toggleMenu();
    },

    routeToPrimaryAction: function(e){

      console.log("routeToPrimaryAction");
      console.log(this.primaryAction);

      e.preventDefault();

      this.closeMenu();

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