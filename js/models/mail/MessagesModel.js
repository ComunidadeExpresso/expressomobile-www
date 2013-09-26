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
        console.log(files[i]);
        if (files[i].fileID != fileID) {
          newFiles.push(files[i]);
        }
      }
      this.set("files",newFiles);
    },
    
    route: function() {
      return '/Mail/Messages/' + this.get("msgID") + "/" + this.get("folderID");
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

    getAttachmentRoute: function(attachmentID) {
      var retVal = '';
      var that = this;
      _.each(this.get("msgAttachments"), function(msgAttachment){
        if (msgAttachment.attachmentID == attachmentID) {
          retVal = '/Mail/Message/Attachment/' + msgAttachment.attachmentID + "=-=" + msgAttachment.attachmentName + "=-=" + msgAttachment.attachmentEncoding+ "=-="+ msgAttachment.attachmentIndex + "=-=" + that.get("msgID") + "=-=" + that.get("folderID");
        }
      });
      return retVal;
    },

    getDownloadAttachmentRoute: function(attachmentID) {
      var retVal = '';
      var that = this;
      _.each(this.get("msgAttachments"), function(msgAttachment){
        if (msgAttachment.attachmentID == attachmentID) {
          retVal = '/Mail/Message/DownloadAttachment/' + msgAttachment.attachmentID + "=-=" + msgAttachment.attachmentName + "=-=" + msgAttachment.attachmentEncoding+ "=-="+ msgAttachment.attachmentIndex + "=-=" + that.get("msgID") + "=-=" + that.get("folderID");
        }
      });
      return retVal;
    },

    getAttachmentSize: function(attachmentID) {
      var retVal = '';
      var that = this;
      _.each(this.get("msgAttachments"), function(msgAttachment){
        if (msgAttachment.attachmentID == attachmentID) {
          retVal = that.bytesToSize(msgAttachment.attachmentSize,0);
        }
      });
      return "" + retVal + "";
    },

    getMessageBody: function(signature) {
      //console.log("getMessageBody");
      // var tmp = document.createElement("DIV");
      // tmp.innerHTML = this.get("msgBody");
      // var retString = tmp.textContent || tmp.innerText || "";
      var retString = this.get("msgBody");
      if (signature == true) {
        retString = this.getUserSignature() + retString;
      }
      //console.log(retString);
      return retString;
    },

    getUserSignature: function() {
      return Shared.settings.mailSignature;
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
        msgCc:this.get("msgCcString"),
        msgBcc:this.get("msgBccString"),
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

    bytesToSize: function(bytes, precision)
    {  
        var kilobyte = 1024;
        var megabyte = kilobyte * 1024;
        var gigabyte = megabyte * 1024;
        var terabyte = gigabyte * 1024;
       
        if ((bytes >= 0) && (bytes < kilobyte)) {
            return bytes + ' B';
     
        } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
            return (bytes / kilobyte).toFixed(precision) + ' KB';
     
        } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
            return (bytes / megabyte).toFixed(precision) + ' MB';
     
        } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
            return (bytes / gigabyte).toFixed(precision) + ' GB';
     
        } else if (bytes >= terabyte) {
            return (bytes / terabyte).toFixed(precision) + ' TB';
     
        } else {
            return bytes + ' B';
        }
    },

  });

  return MessagesModel;

});
