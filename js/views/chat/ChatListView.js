define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/chat/chatListTemplate.html',
  'views/chat/ChatListItemsView',
  'views/chat/ChatWindowView',
  'views/home/LoadingView',
], function($, _, Backbone, Shared, chatListTemplate,ChatListItemsView,ChatWindowView,LoadingView){

  var ChatListView = Backbone.View.extend({

    secondViewName: '',

    render: function(){

      var that = this;

      var primaryElementID = "#content";
      var detailElementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        detailElementID = "#content";
      }

      $(detailElementID).html("");


      Shared.im.clearListeners();

      var onMessageFunction = function (message) { 

        if (message.id != that.secondViewName) {
          var contact = Shared.im.getContactsByID(message.id);
          that.setChatBadge(message.id,contact.qtdUnread);

          if (message.jid != 'me') {

            var pageMessage = {
              type: "chat-message",
              icon: 'icon-jabber',
              title: message.body,
              description: message.jid,
              route: "/Chat/" + message.id,
              timeout: 3000,
              elementID: "#pageMessage",
            }

            Shared.showMessage(pageMessage);

          }

        } else {
          that.setChatBadge(that.secondViewName,0);
          Shared.im.setAsSeenAllMessagesFromContact(that.secondViewName);
        }
        
        Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());

      };

      var onPresenceFunction = function (message) { 

        var element = $("#" + message.id);
        
        element.animate({
          opacity: 0.25,
          height: "toggle"
        }, 1000, function() {

          element.remove();

          $("#list_title_" + message.status).removeClass("hidden");

          $("#list_" + message.status).append(element);
          
          var elementStatus = $("#" + message.id + "_status");
          elementStatus.removeClass();
          elementStatus.addClass("chat-" + message.status);

          element.animate({
          opacity: 1,
          height: "toggle"
          }, 1000, function() {

          });
        
        });
        

      };

      var onErrorFunction = function() {

        that.renderContactList();
        $(detailElementID).html("");
        
      };

      Shared.im.addOnMessageListener(onMessageFunction);
      Shared.im.addOnPresenceListener(onPresenceFunction);
      Shared.im.addOnErrorListener(Shared.onIMErrorFunction);
      Shared.im.addOnDisconnectListener(Shared.onIMDisconnectFunction);
      Shared.im.addOnErrorListener(onErrorFunction);

      if (this.secondViewName != null) {


        var loadingView = new LoadingView({ el: $(detailElementID) });
        loadingView.render();

        if (Shared.detailView != null) {
          Shared.detailView.undelegateEvents();
        }

        setTimeout(function() {

          that.setChatBadge(that.secondViewName,0);
          Shared.im.setAsSeenAllMessagesFromContact(that.secondViewName);

          var chatWindowView = new ChatWindowView({ el: $(detailElementID) });
          chatWindowView.chatID = that.secondViewName;
          chatWindowView.render();

        },Shared.timeoutDelay);
        
      } else { 

        this.renderContactList();

      }

    },

    renderContactList: function() {

        var primaryElementID = "#content";

        var that = this;

        var loadingView = new LoadingView({ el: $(primaryElementID) });
        loadingView.render();

        //Shared.menuView.setChatBadge(0);
        //Shared.im.qtdUnreadMessages(0);

        setTimeout(function() {

          var newData = {
            _: _ 
          };

          var compiledTemplate = _.template( chatListTemplate, newData );
          $(primaryElementID).html( compiledTemplate ); 

          var chatListView = new ChatListItemsView();
          chatListView.render();

          that.loaded();

          Shared.setCurrentView(1,that);

          Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());

        },Shared.timeoutDelay);
    },

    initialize: function() {
      this.secondViewName = "";
    },

    loaded: function () 
    {
      var that = this;
      Shared.scroll = new iScroll('wrapper');
    },

    setChatBadge: function(contactID,value) 
    {
      var elID = "#" + contactID + "_badge";
      if (value > 0) {
        $(elID).removeClass("hidden");
        $(elID).html(value);
      } else {
        $(elID).addClass("hidden");
        $(elID).html(value);
      }
    }


  });

  return ChatListView;
  
});
