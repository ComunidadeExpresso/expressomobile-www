define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'autocomplete',
  'views/calendar/CalendarEditEventAddParticipantsView',
  'text!templates/mail/composeMessageTemplate.html',
  'models/mail/MessagesModel',
  'collections/mail/MessagesCollection',
  'collections/home/ContextMenuCollection',
  'views/mail/PreviewAttachmentMessageView',
  'views/home/LoadingView',
  'collections/contacts/ContactsListCollection',

], function($, _, Backbone, Shared, AutoComplete, CalendarEditEventAddParticipantsView ,composeMessageTemplate,MessagesModel,MessagesCollection,ContextMenuCollection,PreviewAttachmentMessageView,LoadingView,ContactsListCollection){

  var ComposeMessageView = Backbone.View.extend({

    secondViewName: '',
    emailTo: '',
    msgID: '',
    folderID: '',
    currentMessage : '',


    addContactToField: function(params) {

      for (var i = 0, f; participant = params.listParticipants[i]; i++) {
        params.model.addRecipient(params.model.get("currentField"), participant.participantMail, participant.participantName);
      }

      this.renderComposeMessage(params.model,false);
    },

    renderComposeMessage: function(pMessage,signature,forwardString) {
      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      var withSignature = true;

      if (signature == false) {
        withSignature = false;
      }

      var newData = {
        _: _,
        message: pMessage,
        isDesktop: Shared.isDesktop(),
        withSignature: withSignature,
        msgForwardString: forwardString
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

            that.prependAttachmentImage(fileID,f.name,f.size,'binary',files[i]);

            Shared.currentDraftMessage.addBinaryFile(fileID,escape(f.name),files[i]);

          }

          that.updateBody();
        };

        var dropZone = document.getElementById('msgAttachmentsRecipients');
        $(dropZone).addClass("drop_zone");
        $("#msgAttachmentsRow").removeClass("hidden");
        dropZone.addEventListener('dragover', handleDragOverDropZone, false);
        dropZone.addEventListener('drop', handleFileSelectInDropZone, false);
        
        this.setupAutoComplete();

      }

      this.loaded();
    },

    renderAttachments: function(message) {

      this.showAttachments();

      Shared.currentDraftMessage.clearFiles();

      if (message != undefined) {
        
        var attachments = message.get("msgAttachments");
        for (var i in attachments) {

          var attachment = attachments[i];

          var preview = new PreviewAttachmentMessageView();

          preview.fileID = attachment.attachmentID;
          preview.fileName = attachment.attachmentName;
          preview.fileSize = attachment.attachmentSize;
          preview.fileEncoding = attachment.attachmentEncoding;
          preview.fileIndex = attachment.attachmentIndex;
          preview.msgID = message.get("msgID");
          preview.folderID = message.get("folderID");
          preview.fileData = '';

          preview.previewType = 'compose';

          var OnDownloadFile = function(fileID,fileData,fileName,fileType) {
            Shared.currentDraftMessage.addFile(fileID,fileData,fileName,fileType);
          }

          preview.forceDownloadFile = OnDownloadFile;

          preview.render();
        }

      }
    },

    setupAutoComplete: function() {
      var that = this;
      var contactsData = new ContactsListCollection();
        contactsData.getContacts('', '1')
        .done(function (data) 
        {

          var ThatClass = that;

            var onSelectMsgToFunction = function(model) {
              var prefix = "msgTo";
              $("#" + prefix + "Input").val("");
              ThatClass.prependEmailRecipientBadgeToDiv(prefix,"#" + prefix + "Recipients",model.getEmailString(),model.get('contactFirstName') + " " + model.get('contactLastName'));
            };

            var onSelectMsgCcFunction = function(model) {
              var prefix = "msgCc";
              $("#" + prefix + "Input").val("");
              ThatClass.prependEmailRecipientBadgeToDiv(prefix,"#" + prefix + "Recipients",model.getEmailString(),model.get('contactFirstName') + " " + model.get('contactLastName'));
            };

            var onSelectMsgBccFunction = function(model) {
              var prefix = "msgBcc";
              $("#" + prefix + "Input").val("");
              ThatClass.prependEmailRecipientBadgeToDiv(prefix,"#" + prefix + "Recipients",model.getEmailString(),model.get('contactFirstName') + " " + model.get('contactLastName'));
            };
            
            $('#msgToInput').autocomplete({
              collection: data,
              attr: 'contactSearchString',
              attrID: 'contactID',
              noCase: true,
              width: '95%',
              onselect: onSelectMsgToFunction,
              ul_class: 'autocomplete shadow',
              ul_css: {'z-index':1234},
              max_results: 10
            });

            $('#msgCcInput').autocomplete({
              collection: data,
              attr: 'contactSearchString',
              attrID: 'contactID',
              noCase: true,
              width: '95%',
              onselect: onSelectMsgCcFunction,
              ul_class: 'autocomplete shadow',
              ul_css: {'z-index':1234},
              max_results: 10
            });

            $('#msgBccInput').autocomplete({
              collection: data,
              attr: 'contactSearchString',
              attrID: 'contactID',
              noCase: true,
              width: '95%',
              onselect: onSelectMsgBccFunction,
              ul_class: 'autocomplete shadow',
              ul_css: {'z-index':1234},
              max_results: 10
            });
        })
        .fail(function (data) 
        {
          // callbackFail({ error: data.error, _: _ });
        });
    },

    getContextMenuParams: function() {
      var params = {};
      params.sendCallBack = this.sendMessage;
      params.addCcBccCallBack = this.addCcBcc;
      params.removeCcBccCallBack = this.removeCcBcc;
      params.takePictureCallBack = this.takePicture;
      params.selectPictureCallBack = this.selectPicture;
      params.parentCallBack = this;
      return params;
    },

    renderContextMenu: function() {
      
      var params = this.getContextMenuParams();
      if ($("#msgCcRow").hasClass("hidden")) {
        Shared.menuView.renderContextMenu('newMessage',params);
      } else {
        Shared.menuView.renderContextMenu('newMessageWithCc',params);
      }
    },

    sendMessage: function(thisView) {

      var that = thisView;

      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      var onSendMessage = function(result) {

        var res = JSON.parse(result);

        if (res.error == undefined) {
          var message = {
            type: "success",
            icon: 'icon-email',
            title: "Mensagem enviada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          }

        } else {

          var message = {
            type: "error",
            icon: 'icon-email',
            title: "Sua Mensagem não pode ser enviada!",
            description: "",
            elementID: "#pageMessage",
          }

        }
      
        
        Shared.showMessage(message);

        Shared.router.navigate("/Mail/Messages/1/0/INBOX",{ trigger: true });

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

        Shared.router.navigate("/Mail/Messages/1/0/INBOX",{ trigger: true });
        
      };

      var Message = thisView.getNewMessageModel();

      var loadingView = new LoadingView({ el: $(elementID) });
      loadingView.render();

      Message.send(onSendMessage,onFailSendMessage);

    },

    onFailUploadPicture: function(message) {
       Shared.showMessage({
          type: "warning",
          icon: 'icon-email',
          title: "Não foi possível adicionar a foto aos anexos!",
          description: "",
          elementID: "#pageMessage",
        });
    },

    uploadPicture: function(imageData) {

      var that = Shared.currentView;

      that.showAttachments();

      var fileID = Shared.currentDraftMessage.getQtdFiles();

      that.prependAttachmentImage(fileID,'Foto ' + fileID + ".png",'','base64',imageData);

      Shared.currentDraftMessage.addFile(fileID,imageData,'Foto ' + fileID + ".png","base64");

      that.renderContextMenu();
    },

    selectPicture: function(thisView) {

        if ((Shared.isPhonegap()) && (navigator.camera != undefined)) {

          Shared.currentView = thisView;

          navigator.camera.getPicture(thisView.uploadPicture, thisView.onFailUploadPicture, { quality: 60, 
            destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY }); 
        } else {
          Shared.showMessage({
            type: "error",
            icon: 'icon-email',
            title: "Seu dispositivo não possui câmera!",
            description: "",
            elementID: "#pageMessage",
          });
        }
    },

    takePicture: function(thisView) {


      if ((Shared.isPhonegap()) && (navigator.camera != undefined)) {

          Shared.currentView = thisView;

          navigator.camera.getPicture(thisView.uploadPicture, thisView.onFailUploadPicture, { quality: 60, 
            destinationType: Camera.DestinationType.DATA_URL }); 
        } else {
          Shared.showMessage({
            type: "error",
            icon: 'icon-email',
            title: "Seu dispositivo não possui câmera!",
            description: "",
            elementID: "#pageMessage",
          });
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

            $("#" + mModel.listItemID()).animate({
              opacity: 0.25,
              height: "toggle"
            }, 1000, function() {

              $("#" + mModel.listItemID()).remove();
              $("#scrollerList li:first").addClass("selected");
              $("#" + mModel.listItemID()).animate({
                opacity: 1,
              }, 1000, function() { });

              var messageID = 0;
              var forceReload = 0;
              if ($("#scrollerList li:first").length !== 0) {
                var selectedItemID = $("#scrollerList li:first").attr('id').split("_");
                messageID = selectedItemID[selectedItemID.length - 1];
              }

              if (messageID == undefined) {
                messageID = 0;
                forceReload = 1;
              }

              Shared.router.navigate("/Mail/Messages/" + forceReload + "/" +  messageID + "/" + that.folderID,{ trigger: true });

            });
            

          } else {
            Shared.router.navigate("/Mail/Messages/1/0/" + that.folderID,{ trigger: true });
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

          Shared.router.navigate("/Mail/Messages/1/0/" + that.folderID + "#",{ trigger: true });
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
          var msgCc = newMessage.get("msgCC");
          var msgBcc = newMessage.get("msgBcc");

          newMessage.set("msgTo",[]);
          newMessage.set("msgCc",[]);
          newMessage.set("msgBcc",[]);

          newMessage.addRecipient("msgTo",from.mailAddress, from.fullName);
          for (var i in msgTo) {
            if (msgTo[i].mailAddress != from.mailAddress) {
              newMessage.addRecipient("msgCc",msgTo[i].mailAddress,msgTo[i].fullName);
            }
          }
          for (var i in msgCc) {
            newMessage.addRecipient("msgCc",msgCc[i].mailAddress,msgCc[i].fullName);
          }
          
          newMessage.set("msgSubject","Re: " + newMessage.get("msgSubject"));

          Shared.currentDraftMessage = newMessage;

          that.renderComposeMessage(newMessage,true,result.models[0].get("msgFrom").mailAddress);

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

          var newMessage = result.models[0];

          var from = newMessage.get("msgFrom");

          newMessage.set("msgTo",[]);
          newMessage.addRecipient("msgTo",from.mailAddress, from.fullName);
          newMessage.set("msgSubject","Re: " + newMessage.get("msgSubject"));

          Shared.currentDraftMessage = newMessage;

          that.renderComposeMessage(newMessage,true,result.models[0].get("msgFrom").mailAddress);

          
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

          var newMessage = result.models[0];

          newMessage.set("msgTo",[]);
          newMessage.set("msgCc",[]);
          newMessage.set("msgBcc",[]);
          newMessage.set("msgSubject","Fwd: " + newMessage.get("msgSubject"));

          if (newMessage.get("msgHasAttachments") == "1") {

            Shared.currentDraftMessage = newMessage;

            that.renderComposeMessage(newMessage,true,result.models[0].get("msgFrom").mailAddress);

            that.renderAttachments(Shared.currentDraftMessage);

          } else {

            Shared.currentDraftMessage = newMessage;

            that.renderComposeMessage(newMessage,true,result.models[0].get("msgFrom").mailAddress);

          }

        };
        var ForwardOnGetMessageFailed = function() {
          
        };

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var mCollection = new MessagesCollection();

        mCollection.getMessageByID( this.folderID, this.msgID).done(ForwardOnGetMessage).fail(ForwardOnGetMessageFailed).execute();

      }

    },

    addCcBcc: function(thisView) {
      thisView.toggleCCBcc();
      var params = thisView.getContextMenuParams();
      Shared.menuView.renderContextMenu('newMessageWithCc',params);
    },

    removeCcBcc: function(thisView) {
      thisView.toggleCCBcc();
      var params = thisView.getContextMenuParams();
      Shared.menuView.renderContextMenu('newMessage',params);
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
      "click #addMsgToField" : "addMsgToField",
      "click #addMsgCcField" : "addMsgCcField",
      "click #addMsgBccField" : "addMsgBccField",
      "dblclick .recipientmsgTo" : "removeRecipientMsgTo",
      "dblclick .recipientmsgCc" : "removeRecipientMsgCc",
      "dblclick .recipientmsgBcc" : "removeRecipientMsgBcc",
      "touch .recipientmsgTo" : "removeRecipientMsgTo",
      "touch .recipientmsgCc" : "removeRecipientMsgCc",
      "touch .recipientmsgBcc" : "removeRecipientMsgBcc",
    },

    removeRecipientMsgTo: function(e) {
      var email = $(e.currentTarget).attr("data-mail");
      $(e.currentTarget).remove();
      Shared.currentDraftMessage.removeRecipient("msgTo",email);
    },

    removeRecipientMsgCc: function(e) {
      var email = $(e.currentTarget).attr("data-mail");
      $(e.currentTarget).remove();
      Shared.currentDraftMessage.removeRecipient("msgCc",email);
    },

    removeRecipientMsgBcc: function(e) {
      var email = $(e.currentTarget).attr("data-mail");
      $(e.currentTarget).remove();
      Shared.currentDraftMessage.removeRecipient("msgBcc",email);
    },

    addMsgToField: function(e) {

      this.updateCurrentDraftMessage();
      var obj = Shared.currentDraftMessage;

      var attrs = {
        currentField: "msgTo",
        eventParticipants: [],
        listParticipants: [],
      }

      obj.set(attrs);

      var calendarEditEventAddParticipantsView = new CalendarEditEventAddParticipantsView({ listParticipants: [], model: obj, view: new ComposeMessageView(), senderName: 'compose' });
      calendarEditEventAddParticipantsView.senderName = 'compose';
      calendarEditEventAddParticipantsView.render();
    },

    addMsgCcField: function(e) {

      this.updateCurrentDraftMessage();

      var obj = Shared.currentDraftMessage;

      var attrs = {
        currentField: "msgCc",
        eventParticipants: [],
        listParticipants: [],
      }

      obj.set(attrs);

      var calendarEditEventAddParticipantsView = new CalendarEditEventAddParticipantsView({ listParticipants: [], model: obj, view: new ComposeMessageView(), senderName: 'compose' });
      calendarEditEventAddParticipantsView.senderName = 'compose';
      calendarEditEventAddParticipantsView.render();
    },

    addMsgBccField: function(e) {

      this.updateCurrentDraftMessage();
      
      var obj = Shared.currentDraftMessage;

      var attrs = {
        currentField: "msgBcc",
        eventParticipants: [],
        listParticipants: [],
      }

      obj.set(attrs);

      var calendarEditEventAddParticipantsView = new CalendarEditEventAddParticipantsView({ listParticipants: [], model: obj, view: new ComposeMessageView(), senderName: 'compose' });
      calendarEditEventAddParticipantsView.senderName = 'compose';
      calendarEditEventAddParticipantsView.render();
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

      if ( (e.which == 13 && !e.shiftKey) || (e.which == 32) || (e.which == 188) || (e.which == 59) ) {
        if (this.validateEmail($.trim(val))) {
          $(e.currentTarget).val("");
          this.prependEmailRecipientBadgeToDiv(prefix,"#" + prefix + "Recipients",val);

          if ((e.which == 188) || (e.which == 59) || (e.which == 32)) {
            e.preventDefault();
          }
        } else {
          if ( (e.which == 13 && !e.shiftKey && val == "") || (e.which == 9) ) {
            $("#" + nextOrder + "Input").focus();

          }
        }
      }
      if ( (e.which == 8) && ($.trim(val) == "") ) {
        Shared.currentDraftMessage.removeRecipient(prefix,$("#" + prefix + "Recipients div:last-child").attr("data-mail"));
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

    prependEmailRecipientBadgeToDiv: function(prefix,divID,emailRecipient,emailName) {

      var div = $("<div />").addClass("recipient" + prefix).attr("data-mail",emailRecipient);

      var span = $("<span />").addClass("badge").addClass("badge-write-message");

      if (emailName == undefined) {
        span.html(emailRecipient);
      } else {
        span.html(emailName);
      }

      var input = $("<input />").attr("type","text").addClass("hidden").addClass(prefix + "Input").attr("name", prefix+ "Input").attr("value",emailRecipient);

      span.appendTo(div)
      input.appendTo(div);

      Shared.currentDraftMessage.addRecipient(prefix,emailRecipient,"");

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
      if ($("#" + prefix + "Input").val() != "") {
        string = string + ", " + $("#" + prefix + "Input").val();
      }
      // var res = string.substring(0,string.length - 2);
      return string;
    },

    // addRecipientsToMessage: function(prefix,pMessage) {
    //   var string = '';
    //   $("." + prefix + "Input").each(function(i, obj) {
    //     $(obj).val();
    //   });
    //   return pMessage;
    // },

    restoreDraftMessage: function() {

      var draft = Shared.currentDraftMessage;

      var subject = draft.get("msgSubject");
      if (subject != "") {
        $("#msgSubjectTitle").html(draft.get("msgSubject"));
      }
      $("#msgSubjectInput").val(subject);

      $("#msgBodyInput").html(draft.get("msgBody"));

    },

    updateCurrentDraftMessage: function() {
      var model = this.getNewMessageModel();
      Shared.currentDraftMessage = model;
    },

    getNewMessageModel: function() {

      //LOAD TEMP FILES
      var tempFiles = {};
      if (Shared.currentDraftMessage) {
        tempFiles = Shared.currentDraftMessage.get("files");
      }

      var msgTo = this.getMessageStringForRecipient("msgTo");
      var msgSubject = $("#msgSubjectInput").val();
      var msgCc = this.getMessageStringForRecipient("msgCc");
      var msgBcc = this.getMessageStringForRecipient("msgBcc");
      var msgBody = $("#msgBodyInput").html();

      var message = { 
        "msgTo" : Shared.currentDraftMessage.get("msgTo"),
        "msgCc" : Shared.currentDraftMessage.get("msgCc"),
        "msgBcc" : Shared.currentDraftMessage.get("msgBcc"),
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
      var top = $('.topHeader').outerHeight(true);
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

      var msgBodyInput = $("#msgBodyInput").width();
      var contentDetailWidth = $("#contentDetail").width();

      if ((msgBodyInput + 13) >= contentDetailWidth) {
        $("#scrollerDetail").width(msgBodyInput + 13);
      }

      Shared.scrollDetail = new iScroll('wrapperDetail',{vScroll:true, hScroll:true, hScrollBar: true, vScrollBar: true, zoom: true });

    }
  });

  return ComposeMessageView;
  
});

