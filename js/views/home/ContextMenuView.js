define([
  'jquery',
  'underscore',
  'iscroll',
  'jquery_touchwipe',
  'backbone',
  'shared',
  'text!templates/home/contextMenuTemplate.html',
  'collections/home/ContextMenuCollection',
], function($, _, iscroll, touchWipe, Backbone, Shared, contextMenuTemplate,ContextMenuCollection){

  var ContextMenuView = Backbone.View.extend({

    menuOpen: false,
    profile: null,
    collection: null,
    primaryAction: '',
    callBack: '',
    parentCallBack: '',

    render: function(){

      if (this.collection == null) {
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


    clickMainAppPageContent: function(e) {

       if (!$('#contextMenu').hasClass("hidden")) {
        if (!Shared.contextMenulastHasHiddenClass) {
          $('#contextMenu').addClass("hidden");
        }
       }
       Shared.contextMenulastHasHiddenClass = $('#contextMenu').hasClass("hidden");

    },

    initialize : function ( options ) {
       $(window).off("click");
       $(window).on("click",this.clickMainAppPageContent);
       Shared.lastHasClass = true;
    },

    events: {
      "click #contextMenuButton": "toggleMenu",
      "click #btn-primary-action": "routeToPrimaryAction",
      "click #contextMenu ul li a": "selectContextMenuItem",
    },

    selectContextMenuItem: function(e){
      e.preventDefault();

      var href = e.currentTarget.getAttribute("href");

      var id = e.currentTarget.getAttribute("id");

      if (href != '#') {
        Shared.router.navigate(href,{trigger: true});
      } else {

        var context = this.collection.getActionById(id);

        this.callBack = context.get("callBack");
        this.parentCallBack = context.get("parentCallBack");

        this.callBack(this.parentCallBack);

      }
      
      this.toggleMenu();
    },

    routeToPrimaryAction: function(e){

      e.preventDefault();
      this.closeMenu();

      if (this.primaryAction != '#') {
        Shared.router.navigate(this.primaryAction,{trigger: true});
      } else {
        //if (this.callBack != '') {
          var primary = this.collection.getPrimaryAction();
          this.callBack( this.parentCallBack);
        //}
      }

    },

    setPrimaryAction: function() {

      var primary = this.collection.getPrimaryAction();
      if (primary) {
        this.primaryAction = primary.get("route");
        this.callBack = primary.get("callBack");
        this.parentCallBack = primary.get("parentCallBack");
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

    toggleMenu: function (e) {

      if (e != undefined) {
        e.preventDefault();
      }
      if (!$('#contextMenu').hasClass("hidden")) {
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