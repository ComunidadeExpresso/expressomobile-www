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

    checkAttachments: function(showMessage) {

      var maxSize = Shared.max_upload_file_size; 
      var maxAttachments = Shared.max_upload_file_qtd; 

      var files = this.get("files");
      var sumSize = 0;

      var retVal = true;

      for (var i in files) {
        sumSize = sumSize + files[i].fileSize;
      }

      if ((sumSize / 1024) > maxSize) {
        var maxMsgSize = Shared.bytesToSize(maxSize * 1024,0);
        retVal = "Sua mensagem está com mais de " + maxMsgSize + "!";
      }

      if (files.length > maxAttachments) {
        retVal = "Sua mensagem está com mais de " + maxAttachments + " anexos!";
      }

      if ((retVal != true) && (showMessage)) {
        if (showMessage) {
          Shared.showMessage({
            type: "warning",
            icon: 'icon-email',
            title: retVal,
            description: "",
            elementID: "#pageMessage",
          });
        }
      }

      return retVal;
      
    },

    clearFiles: function() {
      this.set("files",[]);    
    },

    addFile: function(fileID,fileData,fileName,dataType,fileSize) {
      var files = this.get("files");
      var file = {
        "fileID" : fileID,
        "filename" : decodeURI(fileName),
        "fileSize": fileSize,
        "src": fileData,
        "dataType": dataType,
      };

      files.push(file);

      this.set("files",files);

      this.checkAttachments(true);
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
      return 'Mail_Message_ListItem_' + this.get("folderID").split('/').join('_').split(' ').join('_') + "_" + this.get("msgID");
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

    getMessageBody: function(signature,msgType,msgOriginal) {

      var msgBody = "";
      if (msgOriginal != undefined) {
        msgBody = msgOriginal.get("msgBody");
      } else {
        msgBody = this.get("msgBody");
      }
      
      var retString = "";
      
      if (signature == true) {

        retString = "<br><br>" + this.getUserSignature() + "<br><br>";

        if (msgType == 'forward') {

          retString = retString + msgOriginal.getForwardMessageString(msgOriginal);
          retString = this.nl2br(retString,'<br>');
          retString = retString + msgBody;

        } else {
          if (msgType == 'reply') {
            retString = retString + this.getReplyMessageString(msgOriginal);
            retString = this.nl2br(retString,'<br>');
            retString = retString + '<blockquote style="margin: 0pt 0pt 0pt 0.8ex; padding-left: 1ex; border-left-color: rgb(204, 204, 204); border-left-width: 1px; border-left-style: solid;">' + msgBody + '</blockquote>';
          }
        }
        
        
      } else {
        
        retString = msgBody;
      }

      return retString;
    },

    getReplyMessageString: function(message) {
      var date = message.get("msgDate");
      var retString = "Em " + date + ", " + message.getEmailStringForMessageRecipient(message.get("msgFrom"),true) + " escreveu: \n\n";
      return retString;
    },

    getForwardMessageString: function(message) {

      var retString = "---------- Mensagem encaminhada ----------\n";
      retString = retString + "Remetente: " + message.get("msgFrom").mailAddress + "\n";
      retString = retString + "Data: " + message.get("msgDate") + "\n";
      retString = retString + "Assunto: " + message.get("msgSubject") + "\n";
      retString = retString + "Para: ";

      _.each(message.get("msgTo"), function(msgRecipient){
        retString = retString + message.getEmailStringForMessageRecipient(msgRecipient,true) + ", ";
      }); 

      if (message.get("msgCc").length) {
        retString = retString + "\nCc: ";

        _.each(message.get("msgCc"), function(msgRecipient){
          retString = retString + message.getEmailStringForMessageRecipient(msgRecipient,true) + ", ";
        });
      }

      retString = retString + "\n";

      return retString;
    },

    getUserSignature: function() {
      if (Shared.settings.mailSignature == undefined) {
        Shared.settings.mailSignature = "Mensagem enviada pelo Expresso Mobile.";
      }
      if (Shared.settings.typeSignature != "html") {
        return this.nl2br(Shared.settings.mailSignature,'<br>');
      } else {
        return Shared.settings.mailSignature;
      }
      
    },

    nl2br: function(str, breakTag) {
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
      if (breakTag == undefined) {
        breakTag = '<br>';
      }
      //var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display

      return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '');
    },

    getEmailStringForMessageRecipient: function(emailRecipient,htmlEntities) {
      var resultString = '';
      if (($.trim(emailRecipient.fullName) != '') && ($.trim(emailRecipient.fullName) != 'undefined')) {
        if (htmlEntities == undefined) {
          resultString += '"' +  $.trim(emailRecipient.fullName) + '" <' + emailRecipient.mailAddress + ">";
        } else {
          resultString += '"' +  $.trim(emailRecipient.fullName) + '" &lt;' + emailRecipient.mailAddress + "&gt;";
        }
        
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

    addBinaryFile: function(fileID,fileName,file,callbackSuccess) {
      var reader = new FileReader();
      var that = this;
      reader.fileName = fileName;
      reader.fileID = fileID;
      reader.fileSize = file.size;
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

        that.addFile(reader.fileID,blobBinaryString,escape(reader.fileName),'binary',reader.fileSize);

        if (callbackSuccess != undefined) {
          callbackSuccess(that);
        }

      }

      reader.readAsBinaryString(file);
    },

    addNewMessageFiles: function(callbackSuccess) {

      var that = this;

      var qtdFiles = 1;

      var failLoad = function(evt) {

        alert("Não foi possível anexar um arquivo!\n");
        callbackSuccess(that);
      };

      var gotFile = function(file){

        var callback = function(message) {
          callbackSuccess(message);
        };

        qtdFiles = qtdFiles + 1;

        that.addBinaryFile(qtdFiles,file.name,file,callback);

      };

      var gotFileEntry = function(fileEntry) {
        fileEntry.file(gotFile, failLoad);
      };

      var gotFS = function(fileSystem) {
        
        var files = Shared.newMessageFiles;

        for (var i = 0, f; f = files[i]; i++) {
          var fileName = files[i];
          fileSystem.root.getFile(fileName, null, gotFileEntry, failLoad);
        }

      };

      if (Shared.newMessageFiles != false) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, failLoad);
      } else {
        callbackSuccess(that);
      }
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
        this.api.addFile(files[i].src,files[i].filename,files[i].dataType,files[i].size);
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

    getMessageSize: function() {
      return Shared.bytesToSize(this.get("msgSize"),0);
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
