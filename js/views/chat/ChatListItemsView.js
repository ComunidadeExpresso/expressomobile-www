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
        var message = {
          type: "warning",
          icon: 'icon-jabber',
          title: "Você não está conectado no CHAT.",
          description: "Saia e entre novamente para conectar-se...",
          route: "",
          timeout: 0,
          elementID: "#errorMessage",
        }

        Shared.showMessage(message);
      }

    },
    

  });

  return ChatListItemsView;
  
});
