define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/home/LoadingView',
  'text!templates/mail/previewAttachmentMessageTemplate.html'
], function($, _, Backbone, Shared, LoadingView, previewAttachmentMessageTemplate){

  var PreviewAttachmentMessageView = Backbone.View.extend({

    previewType: 'compose', //detailMessage
    fileID : "",
    fileName: "",
    fileEncoding: "",
    fileIndex: "",
    fileType: "",
    fileSize: "",
    fileData: "",
    msgID: "",
    folderID: "",
    hasPreview: false,

    render: function(){

      var elementID = "#msgAttachmentsRecipients";

      var newData = {
        fileID: this.fileID,
        fileName: this.fileName,
        fileType: this.fileType,
        fileSize: this.fileSize,
        fileData: this.fileData,
        previewType: this.previewType,
        _: _,
        Shared: Shared,
      };

      var compiledTemplate = _.template( previewAttachmentMessageTemplate, newData );

      this.$el.html(compiledTemplate);

      $(elementID).prepend(this.$el);

      if (this.canShowPreview()) {
        this.preview();
      }
    
    },

    events: {
      "touchend .touchDownloadAttachmentLink" : "download",
      "click .downloadAttachmentLink" : "download",
      "click .deleteAttachmentLink" : "deleteAttachment",
    },

    
    startLoading: function() {
      var imageID = "attachment_image_" + this.fileID;
      $("#attachment_image_" + this.fileID).addClass("hidden");
      $("#attach_" + this.fileID).removeClass("attachment-arquivo-background");
      var div = $("<div />").addClass("spinner").attr("style","position: absolute; margin-top: 20px; margin-left: 40px; "); 
      $("#preview_" + this.fileID).empty().prepend(div);
    },

    stopLoading: function() {
      $("#attachment_image_" + this.fileID).removeClass("hidden");
      $("#attach_" + this.fileID).addClass("attachment-arquivo-background");
      $("#preview_" + this.fileID).empty();
    },

    deleteAttachment: function(e) {

      Shared.currentDraftMessage.removeFileByID(this.fileID);

      $("#attach_" + this.fileID).remove();

    },

    canShowPreview: function() {
      var fileExtension = this.fileName.toLowerCase().substr(this.fileName.length - 3,3);

      var retVal = false;

      if (this.fileData == "") {

      // if (Shared.isDesktop()) {

        switch(fileExtension)
          {
          case "png":
            retVal = true;
            break;
          case "jpg":
            retVal = true;
            break;
          }
      // }

      }

      return retVal;
    },

    showImage: function(base64) {

      if (!this.hasPreview) {

        var imageID = "attachment_image_" + this.fileID;

        var div = $("<div />").attr("style","position: relative; overflow: hidden; height: 100%;").addClass("grow");
        var img = $("<img />").attr("style","position: relative; left: 0px;").addClass("attachmentImage");

        img.attr("id",imageID);

        img.attr("src","data:image/jpeg;base64," + base64);
        img.appendTo(div);

        $("#attach_" + this.fileID).append(div);

        var width = $("#" + imageID).width();

        var margin = 0;

        //alert(width);

        if (width < 160) {
          margin = (160 - width) / 2;
        } else if (width > 160) {
          margin = ((160 - width) / 2);
        }

        if (width == 0) {
          margin = 0;
        }

        $("#" + imageID).attr("style","margin-left: " + margin + "px;");

        this.hasPreview = true;
      }

    },

    base64ArrayBuffer: function(arrayBuffer) {
      var base64    = ''
      var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
     
      var bytes         = new Uint8Array(arrayBuffer)
      var byteLength    = bytes.byteLength
      var byteRemainder = byteLength % 3
      var mainLength    = byteLength - byteRemainder
     
      var a, b, c, d
      var chunk
     
      // Main loop deals with bytes in chunks of 3
      for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
     
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1
     
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
      }
     
      // Deal with the remaining bytes and padding
      if (byteRemainder == 1) {
        chunk = bytes[mainLength]
     
        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
     
        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1
     
        base64 += encodings[a] + encodings[b] + '=='
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
     
        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
     
        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
     
        base64 += encodings[a] + encodings[b] + encodings[c] + '='
      }
      
      return base64
    },

    downloadBrowser: function(params,result) {

      var base64 = this.base64ArrayBuffer(result);
      this.showImage(base64);
      
      var name = params.attachmentName;
      var url = URL.createObjectURL(new Blob([result]));
      var link = document.createElement("a");
      link.setAttribute("href",url);
      link.setAttribute("download",name);
      $('body').append(link);
      var event = document.createEvent('MouseEvents');
      event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
      link.dispatchEvent(event);
      $(link).trigger('click');

    },

    downloadPhonegap: function(params,result) {

      var base64 = this.base64ArrayBuffer(result);

      this.showImage(base64);

      window.plugins.webintent.saveImage(base64,  {filename:params.attachmentName, overwrite: true}, 
       function(fileURL) {

          var fileExtension = params.attachmentName.toLowerCase().substr(params.attachmentName.length - 3,3);

          var fileType = "application/*";

          switch(fileExtension)
          {
          case "png":
            fileType = "image/*";
            break;
          case "pdf":
            fileType = "application/pdf";
            break;
          }

          window.plugins.webintent.startActivity({
            action: window.plugins.webintent.ACTION_VIEW,
            type: fileType,
            url: "file://" + fileURL 
          },
            function () {},
            function () {alert('Não foi possível abrir o Arquivo.') }
          );
          
       }, function(error) {
          alert(error);
       });
    
    },

    getFileData: function(callBack) {
      var that = this;

      this.startLoading();

      var params = {
        attachmentID : this.fileID,
        attachmentName : this.fileName,
        attachmentEncoding : this.fileEncoding,
        attachmentIndex : this.fileIndex,
        msgID : this.msgID,
        folderID : this.folderID,
      };

      Shared.api.resource('/Mail/Attachment').dataType("arraybuffer").params(params).done(function(result){

        that.stopLoading();

        callBack(params,result);

      }).execute();
    },

    download: function() {

      var that = this; 

      this.getFileData(function(params,result) {

        if (Shared.isPhonegap()) {
          that.downloadPhonegap(params,result);
        } else {
          that.downloadBrowser(params,result);
        }

      });
 
    },

    preview: function(e) {

      var that = this; 

      this.getFileData(function(params,result) {

        var base64 = that.base64ArrayBuffer(result);

        that.showImage(base64);

      });
 
    },


  });

  return PreviewAttachmentMessageView;
  
});
