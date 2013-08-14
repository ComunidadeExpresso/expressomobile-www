define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/chat/chatListTemplate.html',
  'views/chat/ChatListItemsView',
  'views/chat/ChatWindowView',
], function($, _, Backbone, Shared, chatListTemplate,ChatListItemsView,ChatWindowView){

  var ChatListView = Backbone.View.extend({

    secondViewName: '',

    render: function(){

      var that = this;

      var primaryElementID = "#content";
      var detailElementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        detailElementID = "#content";
      }

      $(detailElementID).html("");

      if (this.secondViewName != null) {
        //console.log(this.secondViewName);

        var chatWindowView = new ChatWindowView({ el: $(detailElementID) });
        chatWindowView.chatID = this.secondViewName;
        chatWindowView.render();
        
      } else { 
        var newData = {
          _: _ 
        };

        var compiledTemplate = _.template( chatListTemplate, newData );
        $(primaryElementID).html( compiledTemplate ); 

        var chatListView = new ChatListItemsView();
        chatListView.render();

        this.loaded();

      }

    },

    events: {
      "click .listItemLink": "selectListItem"
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

      //Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    },

    initialize: function() {
      this.secondViewName = "";
    },

    loaded: function () 
    {

      var that = this;
      Shared.scroll = new iScroll('wrapper');

    }
  });

  return ChatListView;
  
});
