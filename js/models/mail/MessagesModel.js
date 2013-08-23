define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var MessagesModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        msgID: "",
        folderID: "",
        msgDate: "",
        msgFrom: {
          "fullName": "",
          "mailAddress": ""
        },
        msgTo: [
          // {
          //   "fullName": "",
          //   "mailAddress": ""
          // }
        ],
        msgReplyTo: [
          // {
          //   "fullName": "",
          //   "mailAddress": ""
          // }
        ],
        msgSubject: "",
        msgHasAttachments: "",
        msgFlagged: "",
        msgForwarded: "",
        msgAnswered: "",
        msgDraft: "",
        msgSeen: "",
        msgSize: "",
        msgBodyResume: "",
        msgType: ""
    },

    initialize: function() {
    	this.api = Shared.api;
    	this.readResource = '/Mail/Messages';
		  this.updateResource = '';
		  this.createResource = '/Mail/Send';
		  this.deleteResource = '/Mail/DelMessage';
    },

    
    route: function() {
      return '/Mail/Messages/' + this.get("msgID") + "/" + this.get("folderID");
    },

    listItemID: function() {
      return 'Mail_Message_ListItem_' + this.get("folderID").replace("/","_") + "_" + this.get("msgID");
    },

    getEmailsRecipientsInArray: function(fieldName) {
      var resultString = '';

      var arrEmails = this.get(fieldName);

      for (var i in arrEmails) { 
        resultString += this.getEmailStringForMessageRecipient(arrEmails[i]) + ", ";
      }

      return resultString;
    },

    getMessageBody: function(signature) {
      console.log("getMessageBody");
      // var tmp = document.createElement("DIV");
      // tmp.innerHTML = this.get("msgBody");
      // var retString = tmp.textContent || tmp.innerText || "";
      var retString = this.get("msgBody");
      if (signature == true) {
        retString = this.getUserSignature() + retString;
      }
      console.log(retString);
      return retString;
    },

    getUserSignature: function() {
      return "<br><br>Atenciosamente,<br>Jair Goncalves Pereira Junior<br><br><br>Mensagem Enviada do Expresso Mobile.<br><br><br>";
    },

    getEmailStringForMessageRecipient: function(emailRecipient) {
      var resultString = '';
      if (($.trim(emailRecipient.fullName) != '') && ($.trim(emailRecipient.fullName) != 'undefined')) {
        resultString += '"' +  $.trim(emailRecipient.fullName) + '" <' + emailRecipient.mailAddress + ">";
      } else {
        resultString += emailRecipient.mailAddress + "";
      }
      return resultString;
    },

    htmlDecode: function(text) {
      var decoded = $('<div/>').html(text).text();
      return decoded;
    },

    htmlEncode: function(text) {
      return $('<div/>').text(text).html();
    },

    addRecipient: function(fieldName,email,fullName) {
      var msgRecipient = this.get(fieldName);
      var recipient = {
        "fullName": fullName,
        "mailAddress" : email,
      };

      msgRecipient.push(recipient);

      this.set(fieldName,msgRecipient);
    },
    
    send: function(callbackSuccess,callbackFail) {

      var that = this;

      var params = {
        msgTo:this.get("msgToString"),
        msgCc:this.get("msgCcString"),
        msgBcc:this.get("msgBccString"),
        msgSubject:this.get("msgSubject"),
        msgBody:this.get("msgBody"),
        msgType:this.get("msgType")
      };

      this.api
      .resource(this.createResource)
      .params(params)
      .done(function(result){
        callbackSuccess(result);
      })
      .fail(function(error) {
        callbackFail(result);
      })
      .execute();
    },

    delete: function(callbackSuccess,callbackFail) {

    	var that = this;

      this.api
      .resource(this.deleteResource)
      .params({folderID:this.get("folderID"),msgID:this.get("msgID")})
      .done(function(result){
      	callbackSuccess(result);
      })
      .fail(function(error) {
        callbackFail(result);
      })
      .execute();
    },

  });

  return MessagesModel;

});
