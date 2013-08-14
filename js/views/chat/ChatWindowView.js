define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/chat/chatWindowTemplate.html',
  'text!templates/chat/chatWindowMessagesTemplate.html',
], function($, _, Backbone, Shared, chatWindowTemplate,chatWindowMessagesTemplate){

  var ChatWindowView = Backbone.View.extend({

    el: $("#content"),

    chatID: "",

    currentContact: null,

    render: function(){

      var ThisContact = Shared.im.getContactsByID(this.chatID);

      this.currentContact = ThisContact;

      var that = this;
      var onMessageFunction = function (message) { 
        that.renderMessages();
      };

      var onComposingFunction = function (message) { 
        //if (message.from == that.currentContact.jid) {
          if (message.state == "composing") {
            $("#chatUserName").html(ThisContact.name + " (está escrevendo...)");//  removeClass("hidden");
          } else {
            $("#chatUserName").html(ThisContact.name);
            //$("#chatUserName").addClass("hidden");
          }          
        //}
      };

      Shared.im.setOnMessageFunction(onMessageFunction);
      Shared.im.setOnComposingFunction(onComposingFunction);

      var data = {
        chatID: this.chatID,
        contact: ThisContact,
        _: _ 
      };

      var compiledTemplate = _.template( chatWindowTemplate, data );
      this.$el.html( compiledTemplate );


      this.renderMessages();

      this.loaded();

      Shared.scrollDetail.scrollToElement(document.getElementById("last_message"),200);

      var top = $('.top').outerHeight(true);
      var chat = $('.chatArea').outerHeight(true) == null ? 0 : $('.chatArea').outerHeight(true);
      
      $('body').height($(window).height() - top);
      $('#wrapperDetail').css('top', top + chat);

    },

    events: {
      "keydown #msgToSend": "sendMessage"
    },

    sendMessage: function (e) {
      if(e.which == 13 && !e.shiftKey){
        console.log("sendMessage");
        Shared.im.sendMessage(this.currentContact.jid,$('#msgToSend').val());
        $('#msgToSend').val("");
      }
    },

    renderMessages: function() {

      var allMessages = Shared.im.getMessagesFromID(this.chatID);

      var ThisContact = Shared.im.getContactsByID(this.chatID);

      var data = {
        messages: allMessages,
        chatID: this.chatID,
        contact: ThisContact,
        _: _ 
      };

      var compiledMessagesTemplate = _.template( chatWindowMessagesTemplate, data );
      $("#scrollerDetail").html( compiledMessagesTemplate );


      Shared.scrollDetail.refresh();
      Shared.scrollDetail.scrollToElement(document.getElementById("last_message"),200);

    },

    loaded: function() {
      Shared.scrollDetail = new iScroll('wrapperDetail');
    }

    

  });

  return ChatWindowView;
  
});
