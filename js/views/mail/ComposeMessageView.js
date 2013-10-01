define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/composeMessageTemplate.html',
  'models/mail/MessagesModel',
  'collections/mail/MessagesCollection',
  'collections/home/ContextMenuCollection',
  'views/mail/PreviewAttachmentMessageView',
  'views/home/LoadingView',
], function($, _, Backbone, Shared, composeMessageTemplate,MessagesModel,MessagesCollection,ContextMenuCollection,PreviewAttachmentMessageView,LoadingView){

  var ComposeMessageView = Backbone.View.extend({

    secondViewName: '',
    emailTo: '',
    msgID: '',
    folderID: '',
    currentMessage : '',

    renderComposeMessage: function(pMessage) {
      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      var newData = {
        _: _,
        message: pMessage,
        isDesktop: Shared.isDesktop(),
      };

      var compiledTemplate = _.template( composeMessageTemplate, newData );

      this.$el.html(compiledTemplate);

      $(elementID).empty().append(this.$el);

      this.renderContextMenu();


      if (Shared.isDesktop()) {

        //ENABLE ATTACHMENTS AND DROP ZONE.

        var that = this;

        var handleDragOverDropZone = function(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          evt.dataTransfer.dropEffect = 'copy'; 
        };

        var handleFileSelectInDropZone = function(evt) {

          evt.stopPropagation();
          evt.preventDefault();

          var files = evt.dataTransfer.files; 

          for (var i = 0, f; f = files[i]; i++) {

            var fileID = Shared.currentDraftMessage.getQtdFiles();

            var attachID = that.prependAttachmentImage(fileID,f.name,f.size,'binary');

            Shared.currentDraftMessage.addBinaryFile(attachID,escape(f.name),files[i]);

          }

          that.updateBody();
        };

        var dropZone = document.getElementById('msgAttachmentsRecipients');
        $(dropZone).addClass("drop_zone");
        $("#msgAttachmentsRow").removeClass("hidden");
        dropZone.addEventListener('dragover', handleDragOverDropZone, false);
        dropZone.addEventListener('drop', handleFileSelectInDropZone, false);

      }

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
        pMessage.clearFiles();

        if ($.trim(this.emailTo) != '')
          pMessage.addRecipient("msgTo", this.emailTo, '');

        Shared.currentDraftMessage = pMessage;

        this.renderComposeMessage(pMessage);

      }

      if (this.secondViewName == "Send") {

        var that = this;

        var onSendMessage = function(result) {
        
          var message = {
            type: "success",
            icon: 'icon-email',
            title: "Mensagem enviada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          }

          Shared.showMessage(message);

          Shared.router.navigate("/Mail/Folders/INBOX",{ trigger: true });

        };

        var onFailSendMessage = function(error) {

          var message = {
            type: "error",
            icon: 'icon-email',
            title: "Ocorreu um erro ao enviar a mensagem!",
            description: error.message,
            elementID: "#pageMessage",
          }

          Shared.showMessage(message);

          Shared.router.navigate("/Mail/Folders/INBOX",{ trigger: true });
          
        };

        var Message = this.getNewMessageModel();

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        Message.send(onSendMessage,onFailSendMessage);

      }

      var uploadPicture = function(imageData) {

        that.showAttachments();

        var fileID = Shared.currentDraftMessage.getQtdFiles();

        that.prependAttachmentImage(fileID,'Foto ' + fileID + ".png",'','base64',imageData);

        Shared.currentDraftMessage.addFile(fileID,imageData,'Foto ' + fileID + ".png","base64");

        that.renderContextMenu();

      };
      var onFailUploadPicture = function onFail(message) {
          Shared.showMessage({
            type: "error",
            icon: 'icon-email',
            title: "Não foi possível adicionar a foto aos anexos!",
            description: "",
            elementID: "#pageMessage",
          });
      };

      if (this.secondViewName == "AttachPicture") {

        if ((Shared.isPhonegap()) && (navigator.camera != undefined)) {

          navigator.camera.getPicture(uploadPicture, onFailUploadPicture, { quality: 60, 
            destinationType: Camera.DestinationType.DATA_URL }); 
        } else {
          alert("Seu dispositivo não possui câmera!");
        }
      }

      if (this.secondViewName == "AttachGalleryPicture") {

        
        if ((Shared.isPhonegap()) && (navigator.camera != undefined)) {

          navigator.camera.getPicture(uploadPicture, onFailUploadPicture, { quality: 60, 
            destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY }); 
        } else {
          alert("Seu dispositivo não possui câmera!");
        }
      }

      if (this.secondViewName == "DelMessage") {

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var that = this;

        var onDeleteMessage = function() {

          Shared.showMessage({
            type: "success",
            icon: 'icon-email',
            title: "Mensagem excluída com sucesso!",
            description: "",
            elementID: "#pageMessage",
          });

          var message = { msgID: that.msgID, folderID: that.folderID};
          var mModel = new MessagesModel(message);

          if (Shared.isTabletResolution()) {
            $("#" + mModel.listItemID()).remove();

            Shared.router.navigate("/Mail/Folders/" + that.folderID,{ trigger: true });
          }

        };

        var onFailDeleteMessage = function() {
          Shared.showMessage({
            type: "error",
            icon: 'icon-email',
            title: "Não foi possível excluir a mensagem selecionada!",
            description: "",
            elementID: "#pageMessage",
          });

          Shared.router.navigate("/Mail/Folders/" + that.folderID,{ trigger: true });
        };

        var message = { msgID: this.msgID, folderID: this.folderID};
        var mModel = new MessagesModel(message);

        mModel.delete(onDeleteMessage,onFailDeleteMessage);
        
      }

      if (this.secondViewName == "ReplyToAll") {
        
        

        var ReplyOnGetMessage = function(result) {

          var newMessage = result.models[0];

          var from = newMessage.get("msgFrom");
          var msgTo = newMessage.get("msgTo");
          var msgCc = newMessage.get("msgCc");
          var msgBcc = newMessage.get("msgBcc");

          newMessage.set("msgTo",[]);
          newMessage.set("msgCc",[]);
          newMessage.set("msgBcc",[]);

          newMessage.addRecipient("msgTo",from.mailAddress, from.fullName);
          for (var i in msgTo) {
            newMessage.addRecipient("msgCc",msgTo[i].mailAddress,msgTo[i].fullName);
          }
          for (var i in msgCc) {
            newMessage.addRecipient("msgCc",msgCc[i].mailAddress,msgCc[i].fullName);
          }
          
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
      //Shared.refreshDotDotDot();
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

    prependAttachmentImage: function(fileID,fileName,fileSize,fileType,imageData) {

      var preview = new PreviewAttachmentMessageView();

      preview.fileID = fileID;
      preview.fileName = fileName;
      preview.fileSize = fileSize;
      preview.fileType = fileType;
      preview.fileData = imageData;

      preview.render();

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

    updateCurrentMessage: function() {

    },

    getNewMessageModel: function() {

      //LOAD TEMP FILES
      var tempFiles = Shared.currentDraftMessage.get("files");

      var msgTo = this.getMessageStringForRecipient("msgTo");
      var msgSubject = $("#msgSubjectInput").val();
      var msgCc = this.getMessageStringForRecipient("msgCc");
      var msgBcc = this.getMessageStringForRecipient("msgBcc");
      var msgBody = $("#msgBodyInput").html();

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

      mModel.set("files",tempFiles);

      // $('.attachmentImage').each(function(i, obj) {
      //   var src = $(obj).attr('src').substr($(obj).attr('src').indexOf(bstr)+bstr.length);
      //   mModel.addFile(src,'Anexo ' + (i + 1) + '.png',"base64");
      // }); 

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




