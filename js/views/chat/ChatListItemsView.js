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

      var AllContacts = Shared.im.getAllContacts();

      var data = {
        contacts: AllContacts,
        _: _ 
      };

      var compiledTemplate = _.template( chatListItemsTemplate, data );
      $("#scrollerList").html( compiledTemplate );

    },

    

  });

  return ChatListItemsView;
  
});
