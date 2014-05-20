define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'moment',
  'text!templates/chat/chatWindowTemplate.html',
  'text!templates/chat/chatWindowMessagesTemplate.html',
  'views/home/LoadingView',
], function($, _, Backbone, Shared, moment, chatWindowTemplate,chatWindowMessagesTemplate,LoadingView){

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
        Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());
      };

      var onComposingFunction = function (message) { 

        if (message.from == that.currentContact.jid) {
          var composingText = "";
          if (message.state == "composing") {
            composingText = " (está escrevendo...)";
          } 
          if ($.trim(ThisContact.name) != "") {
            $("#chatUserName").html(ThisContact.name + composingText);
          } else {
            $("#chatUserName").html(ThisContact.jid + composingText);
          }     
        }
      };


      Shared.im.addOnMessageListener(onMessageFunction);
      Shared.im.addOnComposingListener(onComposingFunction);
      Shared.im.addOnErrorListener(Shared.onIMErrorFunction);
      Shared.im.addOnDisconnectListener(Shared.onIMDisconnectFunction);

      Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());

      var data = {
        chatID: this.chatID,
        contact: ThisContact,
        _: _ 
      };

      var compiledTemplate = _.template( chatWindowTemplate, data );
      this.$el.html( compiledTemplate );


      this.renderMessages();

      this.loaded();
      
      var top = $('.topHeader').outerHeight(true);
      var chat = $('.chatArea').outerHeight(true) == null ? 0 : $('.chatArea').outerHeight(true);
      
      $('body').height($(window).height() - top);
      $('#wrapperDetail').css('top', top + chat);

      this.scrollToLastMessage();

      Shared.setCurrentView(2,this);

    },

    events: {
      "keydown #msgToSend": "sendMessage"
    },

    sendMessage: function (e) {
      if(e.which == 13 && !e.shiftKey){
        Shared.im.sendMessage(this.currentContact.jid,$('#msgToSend').val());
        $('#msgToSend').val("");
        $('#msgToSend').blur();
        $('#msgToSend').focus();
      }
    },

    renderMessages: function() {

      var allMessages = Shared.im.getMessagesFromID(this.chatID);

      var ThisContact = Shared.im.getContactsByID(this.chatID);

      var data = {
        messages: allMessages,
        chatID: this.chatID,
        contact: ThisContact,
        moment: moment,
        _: _,
        $ : $
      };

      var compiledMessagesTemplate = _.template( chatWindowMessagesTemplate, data );
      $("#scrollerDetail").html( compiledMessagesTemplate );

      $('.myPicture').each(function() {
        $(this).css("background-image",$("#userPicture").css("background-image"));
        $(this).css("background-size","46px 61px");
      });

      this.scrollToLastMessage();

    },

    scrollToLastMessage: function() {
      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.refresh();
        Shared.scrollDetail.scrollToElement(document.getElementById("last_message"),200);
      }
    },

    loaded: function() {
      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.destroy();
        Shared.scrollDetail = null;
      }
      if (Shared.scrollDetail == null) {
        Shared.scrollDetail = new iScroll('wrapperDetail');
      }
    }

    

  });

  return ChatWindowView;
  
});
