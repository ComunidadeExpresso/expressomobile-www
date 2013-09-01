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

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      var newData = {
        _: _,
        message: pMessage
      };

      var compiledTemplate = _.template( composeMessageTemplate, newData );

      this.$el.html(compiledTemplate);

      $(elementID).empty().append(this.$el);

      this.renderContextMenu();

      var that = this;

      var handleFileSelect = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.dataTransfer.files; 

        var output = [];
        for (var i = 0, f; f = files[i]; i++) {

          output.push("<div class='simple-attachment'><div class='icon'></div><div class='attachment-name'>" + escape(f.name) + "</div><div class='attachment-size'>" + f.size + " bytes</div></div>");

        }
        $("#msgAttachmentsRecipients").prepend(output.join(''));

        that.updateBody();
      }

      var handleDragOver = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; 
      }

      var dropZone = document.getElementById('msgAttachmentsRecipients');
      dropZone.addEventListener('dragover', handleDragOver, false);
      dropZone.addEventListener('drop', handleFileSelect, false);

      this.loaded();
    },

    renderContextMenu: function() {
      if ($("#msgCcRow").hasClass("hidden")) {
        Shared.menuView.renderContextMenu('newMessage',{});
      } else {
        Shared.menuView.renderContextMenu('newMessageWithCc',{});
      }
    },

    render: function(){

      var elementID = "#contentDetail";

      var that = this;

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      if (this.secondViewName == "New") {

        var pMessage = new MessagesModel();
        pMessage.set("msgSubject","");
        pMessage.set("msgTo",[]);
        pMessage.set("msgCc",[]);
        pMessage.set("msgBcc",[]);
        pMessage.set("msgBody","");

        this.renderComposeMessage(pMessage);

      }

      if (this.secondViewName == "Send") {

        var onSendMessage = function() {
          Shared.router.navigate("/Mail/Messages/" + this.folderID,{ trigger: true });
          alert("Sua Mensagem foi Enviada!");
        };

        var onFailSendMessage = function() {
          Shared.router.navigate("/Mail/Messages/" + this.folderID,{ trigger: true });
          alert("Ocorreu um erro ao Enviar sua Mensagem.");

          // 88, 1.88  - 299
          // 78, 1.88  - 
        };

        var Message = this.getNewMessageModel();

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        Message.send(onSendMessage,onFailSendMessage);

      }

      if (this.secondViewName == "AttachPicture") {

        var uploadPhoto = function(imageData) {

          that.showAttachments();

          that.prependAttachmentImage(imageData);

          that.renderContextMenu();

        };
        var onFail = function onFail(message) {
            alert('Não foi possível adicionar a foto aos anexos.');
        };
        if (navigator.camera != undefined) {
          // navigator.camera.getPicture(uploadPhoto, onFail, { quality: 60, 
          // destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY }); 

          navigator.camera.getPicture(uploadPhoto, onFail, { quality: 60, 
            destinationType: Camera.DestinationType.DATA_URL }); 
        } else {
          alert("Seu dispositivo não possui câmera!");
        }
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
      "keydown #msgToInput" : "addRecipientTo",
      "keydown #msgCcInput" : "addRecipientTo",
      "keydown #msgBccInput" : "addRecipientTo",
      "keydown #msgSubjectInput" : "updateSubject",
      "keydown #msgBodyInput" : "updateBody",
      "click #msgToRow" : "focusRecipientTo",
      "click #msgCcRow" : "focusRecipientCc",
      "click #msgBccRow" : "focusRecipientBcc",
      "click #msgSubjectRow" : "focusSubject",
      // "dragover #drop_zone" : "dragover",
    },

    dragover: function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; 
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

    focusSubject: function(e) {
      $("#msgSubjectInput").focus();
    },

    showAttachments: function(e) {
      $("#msgAttachmentsRow").removeClass("hidden");
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

    prependAttachmentImage: function(imageData) {

      var div = $("<figure />").addClass("recipientmsgAttachments");

      var image = $("<img />");
      image.attr("width","70");
      image.attr("height","80");
      image.addClass("attachmentImage");
      image.attr("src","data:image/jpeg;base64," + imageData);

      var link = $("<a />").attr("href","/Mail/Message/RemoveAttachment/");
      
      image.appendTo(link);
      link.appendTo(div);

      div.appendTo($("#msgAttachmentsRecipients"));

      this.updateBody();
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
      string = string + ", " + $("#" + prefix + "Input").val();
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

      var mModel = new MessagesModel(message);

      var bstr = 'base64,';

      mModel.clearFiles();

      $('.attachmentImage').each(function(i, obj) {
        var src = $(obj).attr('src').substr($(obj).attr('src').indexOf(bstr)+bstr.length);
        mModel.addFile(src,'anexo_' + (i + 1) + '.png');
      }); 

      return mModel;
    },

    toggleCCBcc: function() {
      if ($("#msgCcRow").hasClass("hidden")) {
        $("#msgCcRow").removeClass("hidden");
        $("#msgBccRow").removeClass("hidden");
      } else {
        $("#msgCcRow").addClass("hidden");
        $("#msgBccRow").addClass("hidden");
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