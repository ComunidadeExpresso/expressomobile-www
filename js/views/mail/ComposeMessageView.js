define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/composeMessageTemplate.html',
  'models/mail/MessagesModel',
  'collections/mail/MessagesCollection',
  'collections/home/ContextMenuCollection',
  'views/home/LoadingView',
], function($, _, Backbone, Shared, composeMessageTemplate,MessagesModel,MessagesCollection,ContextMenuCollection,LoadingView){

  var ComposeMessageView = Backbone.View.extend({

    secondViewName: '',
    msgID: '',
    folderID: '',

    renderComposeMessage: function(pMessage) {
      var elementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        elementID = "#content";
      }

      var newData = {
        _: _,
        message: pMessage
      };

      var compiledTemplate = _.template( composeMessageTemplate, newData );

      this.$el.html(compiledTemplate);

      $(elementID).empty().append(this.$el);

      Shared.menuView.renderContextMenu('newMessage',{});

      this.loaded();
    },

    render: function(){

      var elementID = "#contentDetail";

      var that = this;

      if (Shared.isSmartPhone()) {
        elementID = "#content";
      }

      if (this.secondViewName == "New") {

        var pMessage = new MessagesModel();
        pMessage.set("msgSubject","");
        pMessage.set("msgTo",[]);
        //pMessage.addRecipient("msgTo","projetomobile@celepar.pr.gov.br","Projeto Mobile");
        pMessage.set("msgBody","");

        this.renderComposeMessage(pMessage);

      }

      if (this.secondViewName == "Send") {

        var onSendMessage = function() {
          Shared.router.navigate("/Mail/Messages/" + this.folderID,{ trigger: true });
        };

        var onFailSendMessage = function() {

        };

        var Message = this.getNewMessageModel();

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        Message.send(onSendMessage,onFailSendMessage);

      }

      if (this.secondViewName == "DelMessage") {

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var onDeleteMessage = function() {
          Shared.router.navigate("/Mail/Messages/" + this.folderID,{ trigger: true });
        };

        var onFailDeleteMessage = function() {

        };

        var message = { msgID: this.msgID, folderID: this.folderID};
        var mModel = new MessagesModel(message);

        mModel.delete(onDeleteMessage,onFailDeleteMessage);
        
      }

      if (this.secondViewName == "ReplyMessage") {
        
        

        var ReplyOnGetMessage = function(result) {

          console.log(result);

          var newMessage = result.models[0];

          var from = newMessage.get("msgFrom");

          newMessage.set("msgTo",[]);
          newMessage.addRecipient("msgTo",from.mailAddress, from.fullName);
          newMessage.set("msgSubject","Re: " + newMessage.get("msgSubject"));

          that.renderComposeMessage(newMessage);

          
        };
        var ReplyOnGetMessageFailed = function() {
          
        };

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var mCollection = new MessagesCollection();

        mCollection.getMessageByID( this.folderID, this.msgID).done(ReplyOnGetMessage).fail(ReplyOnGetMessageFailed).execute();

      }

      if (this.secondViewName == "Forward") {
        
        

        var ForwardOnGetMessage = function(result) {

          console.log(result);

          var newMessage = result.models[0];

          newMessage.set("msgTo",[]);
          newMessage.set("msgCc",[]);
          newMessage.set("msgBcc",[]);
          newMessage.set("msgSubject","Fwd: " + newMessage.get("msgSubject"));

          that.renderComposeMessage(newMessage);

          
        };
        var ForwardOnGetMessageFailed = function() {
          
        };

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var mCollection = new MessagesCollection();

        mCollection.getMessageByID( this.folderID, this.msgID).done(ForwardOnGetMessage).fail(ForwardOnGetMessageFailed).execute();

      }

      if (this.secondViewName == "AddCcBcc") {
        this.toggleCCBcc();
        Shared.menuView.renderContextMenu('newMessageWithCc',{});
      }

      if (this.secondViewName == "RemoveCcBcc") {
        this.toggleCCBcc();
        Shared.menuView.renderContextMenu('newMessage',{});
      }

    },

    events: {
      "keypress #msgToInput" : "addRecipientTo",
      "keydown #msgCcInput" : "addRecipientTo",
      "keydown #msgBccInput" : "addRecipientTo",
      "keydown #msgSubjectInput" : "updateSubject",
      "keydown #msgBodyInput" : "updateBody",
      "click #msgToField" : "focusRecipientTo",
      "click #msgCcField" : "focusRecipientCc",
      "click #msgBccField" : "focusRecipientBcc",
    },

    updateSubject: function(e) {
      var val = $(e.currentTarget).val();
      $('#msgSubjectTitle').html(val);
      if ( (e.which == 13 && !e.shiftKey) ) {
        $("#msgBodyInput").focus();
      }
    },

    updateBody: function(e) {
      Shared.scrollerRefresh();
    },

    focusRecipientTo: function(e) {
      $("#msgToInput").focus();
    },

    focusRecipientCc: function(e) {
      $("#msgCcInput").focus();
    },

    focusRecipientBcc: function(e) {
      $("#msgBccInput").focus();
    },



    addRecipientTo: function(e) {
      var val = $(e.currentTarget).val();

      //console.log(e.which);
      //13 - ENTER
      //32 - ESPAÇO 
      //9 - TAB
      //59 - PONTO E VIRGULA
      //188 - VIRGULA
      //8 - BACKSPACE

      //alert(e.which);
      //alert("jair");

      var prefix = "msgTo";
      var nextOrder = "msgCc";

      if ($(e.currentTarget).attr("id") == "msgToInput") {
        prefix = "msgTo";
        if ($("#msgCCBcc").hasClass("hidden")) {
          nextOrder = "msgSubject";
        } else {
          nextOrder = "msgCc";
        }
      }

      if ($(e.currentTarget).attr("id") == "msgCcInput") {
        prefix = "msgCc";
        nextOrder = "msgBcc";
      }

      if ($(e.currentTarget).attr("id") == "msgBccInput") {
        prefix = "msgBcc";
        nextOrder = "msgSubject";
      }

      if ($(e.currentTarget).attr("id") == "msgSubjectInput") {
        nextOrder = "msgBody";
      }

      console.log($(e.currentTarget).attr("id"));

      if ( (e.which == 13 && !e.shiftKey) || (e.which == 32) || (e.which == 9) || (e.which == 188) ) {
        if (this.validateEmail($.trim(val))) {
          $(e.currentTarget).val("");
          this.prependEmailRecipientBadgeToDiv(prefix,"#" + prefix + "Recipients",val);
        } else {
          if ( (e.which == 13 && !e.shiftKey && val == "") ) {
            // console.log("focus");
            $("#" + nextOrder + "Input").focus();

          }
        }
      }
      if ( (e.which == 8) && ($.trim(val) == "") ) {
        //var value = $("#msgToRecipients div:last-child");
        $("#" + prefix + "Recipients div:last-child").remove();
      }
    },

    prependEmailRecipientBadgeToDiv: function(prefix,divID,emailRecipient) {

      var div = $("<div />").addClass("recipient" + prefix);

      var span = $("<span />").addClass("badge").addClass("badge-write-message").html(emailRecipient);

      var input = $("<input />").attr("type","text").addClass("hidden").addClass(prefix + "Input").attr("name", prefix+ "Input").attr("value",emailRecipient);

      span.appendTo(div)
      input.appendTo(div);

      div.appendTo($(divID));

    },

    validateEmail: function(email) { 
      var ck_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      return ck_email.test(email);
    },

    getMessageStringForRecipient: function(prefix) {
      var string = '';
      var qtd = $("." + prefix + "Input").length;
      $("." + prefix + "Input").each(function(i, obj) {
        string = string + $(obj).val();
        if (i < qtd - 1) {
          string = string + ", ";
        }
      });
      return string;
    },

    // addRecipientsToMessage: function(prefix,pMessage) {
    //   var string = '';
    //   $("." + prefix + "Input").each(function(i, obj) {
    //     $(obj).val();
    //   });
    //   return pMessage;
    // },

    getNewMessageModel: function() {


      var msgTo = this.getMessageStringForRecipient("msgTo");
      var msgSubject = $("#msgSubjectInput").val();
      var msgCc = this.getMessageStringForRecipient("msgCc");
      var msgBcc = this.getMessageStringForRecipient("msgBcc");
      var value = $("#msgBodyInput").html();
      // value = value.replace(/<br>/g, "\\r\\n");
      // alert(value);
      var msgBody = value;

      var message = { 
        "msgToString" : msgTo,
        "msgCcString" : msgCc,
        "msgBccString" : msgBcc,
        "msgSubject" : msgSubject,
        "msgBody" : msgBody,
        "msgType" : "html"
      }

      console.log(message);

      var mModel = new MessagesModel(message);

      return mModel;
    },

    toggleCCBcc: function() {
      if ($("#msgCCBcc").hasClass("hidden")) {
        $("#msgCCBcc").removeClass("hidden");
      } else {
        $("#msgCCBcc").addClass("hidden");
      }
      
    },

    refreshWindowHeight: function() {
      var top = $('.top').outerHeight(true);
      var search = $('#composeMessageHeader').outerHeight(true) == null ? 0 : $('#composeMessageHeader').outerHeight(true);
      $('#msgBody').height($(window).height() - top - search);

      Shared.scrollerRefresh();
    },

    loaded: function () 
    {

      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.destroy();
        Shared.scrollDetail = null;
      }

      this.refreshWindowHeight();

      
      Shared.scrollDetail = new iScroll('wrapperDetail');
    }
  });

  return ComposeMessageView;
  
});