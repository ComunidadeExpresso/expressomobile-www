define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/chat/chatListItemsTemplate.html',
], function($, _, Backbone, Shared, chatListItemsTemplate){

  var ChatListItemsView = Backbone.View.extend({

    render: function(){

      var that = this;

      var isConnected = Shared.im.isConnected();

      var AllContacts = [];

      if (isConnected) {
        AllContacts = Shared.im.getAllContacts();
      }
      

      var data = {
        contacts: AllContacts,
        isConnected: isConnected,
        _: _ 
      };

      var compiledTemplate = _.template( chatListItemsTemplate, data );
      $("#scrollerList").html( compiledTemplate );

       if (!isConnected) {
          Shared.menuView.renderContextMenu('chatOffline',{});
       }

    },


  });

  return ChatListItemsView;
  
});
