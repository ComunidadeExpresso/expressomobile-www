define([
  'underscore',
  'backbone',
  'shared',
  'moment',
], function(_, Backbone, Shared, moment) {
  
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
        msgCc: [
        ],
        msgCC: [
        ],
        msgBcc: [
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
        msgType: "",
        files: [],
    },

    initialize: function() {
    	this.api = Shared.api;
    	this.readResource = '/Mail/Messages';
		  this.updateResource = '';
		  this.createResource = '/Mail/Send';
		  this.deleteResource = '/Mail/DelMessage';
    },

    clearFiles: function() {
      this.set("files",[]);    
    },

    addFile: function(fileID,fileData,fileName,dataType) {
      var files = this.get("files");
      var file = {
        "fileID" : fileID,
        "filename" : fileName,
        "src": fileData,
        "dataType": dataType,
      };

      files.push(file);

      this.set("files",files);
    },

    removeFileByID: function(fileID) {
      var files = this.get("files");
      var newFiles = [];
      for (var i in files) {
        if (files[i].fileID != fileID) {
          newFiles.push(files[i]);
        }
      }
      this.set("files",newFiles);
    },
    
    route: function() {
      return '/Mail/Messages/0/' + this.get("msgID") + "/" + this.get("folderID");
    },

    listItemID: function() {
      return 'Mail_Message_ListItem_' + this.get("folderID").split('/').join('_') + "_" + this.get("msgID");
    },

    getEmailsRecipientsInArray: function(fieldName) {
      var resultString = '';

      var arrEmails = this.get(fieldName);

      for (var i in arrEmails) { 
        resultString += this.getEmailStringForMessageRecipient(arrEmails[i]) + ", ";
      }

      return resultString;
    },

    getAttachmentSize: function(attachmentID) {
      var retVal = '';
      var that = this;
      _.each(this.get("msgAttachments"), function(msgAttachment){
        if (msgAttachment.attachmentID == attachmentID) {
          retVal = Shared.bytesToSize(msgAttachment.attachmentSize,0);
        }
      });
      return "" + retVal + "";
    },

    getMessageBody: function(signature,forwardString) {

      var msgBody = this.get("msgBody");
      var retString = "";
      if (signature == true) {
        retString = "\n\n" + this.getUserSignature() + "\n\n";
        if (forwardString != undefined) {
          retString = retString + this.getForwardMessageString(forwardString);
          retString = retString + "<div style='width: 100%; border-left: 2px solid #000; margin-left: 20px;'><div style='margin: 20px;'>" + msgBody + "</div></div>";
        }
        retString = this.nl2br(retString);
      } else {
        retString = msgBody;
      }

      return retString;
    },

    getForwardMessageString: function(message) {
      var date = this.get("msgDate");
      var retString = "Em " + date + ", &lt;" + message + "&gt; escreveu: \n\n";
      return retString;
    },

    getUserSignature: function() {
      return Shared.settings.mailSignature;
    },

    nl2br: function(str, is_xhtml) {
      // http://kevin.vanzonneveld.net
      // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Philip Peterson
      // +   improved by: Onno Marsman
      // +   improved by: Atli Þór
      // +   bugfixed by: Onno Marsman
      // +      input by: Brett Zamir (http://brett-zamir.me)
      // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   improved by: Brett Zamir (http://brett-zamir.me)
      // +   improved by: Maximusya
      // *     example 1: nl2br('Kevin\nvan\nZonneveld');
      // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
      // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
      // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
      // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
      // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
      var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '');
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

    removeRecipient: function(fieldName,email) {
      var msgRecipient = this.get(fieldName);

      var newMsgRecipient = [];

      for (var i = 0, f; recipient = msgRecipient[i]; i++) {
        if (recipient.mailAddress != email) {
          newMsgRecipient.push(recipient);
        }
      }

      console.log(fieldName);
      console.log(newMsgRecipient);
  
      this.set(fieldName,newMsgRecipient);
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

    getTimeAgo: function() {
      var date = this.get("msgDate");
      return moment(date, "DD/MM/YYYY hh:mm").fromNow();
    },

    getQtdFiles: function() {
      var files = this.get("files");
      return files.length;
    },

    addBinaryFile: function(fileID,fileName,file) {
      var reader = new FileReader();
      var that = this;
      reader.fileName = fileName;
      reader.fileID = fileID;
      reader.onerror = function(e) {
      };
      reader.onprogress = function(e) {

      };
      reader.onabort = function(e) {
        
      };
      reader.onloadstart = function(e) {
        
      };
      reader.onload = function(e) {

        blobBinaryString = reader.result;

        that.addFile(reader.fileID,blobBinaryString,escape(reader.fileName),'binary');
                        
        //console.log(blobBinaryString);
      }

      reader.readAsBinaryString(file);
    },
    
    send: function(callbackSuccess,callbackFail) {

      var that = this;

      var params = {
        msgTo:this.get("msgToString"),
        msgCcTo:this.get("msgCcString"),
        msgBccTo:this.get("msgBccString"),
        msgSubject:this.get("msgSubject"),
        msgBody:this.get("msgBody"),
        msgType:this.get("msgType")
      };

      var files = this.get("files");

      this.api
      .resource(this.createResource)
      .params(params);

      this.api.clearFiles();

      for (var i in files) {
        this.api.addFile(files[i].src,files[i].filename,files[i].dataType);
      }

      this.api
      .dataType("fileupload")
      .done(function(result){
        callbackSuccess(result);
      })
      .fail(function(error) {
        callbackFail(error);
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
        callbackFail(error);
      })
      .execute();
    },



  });

  return MessagesModel;

});
