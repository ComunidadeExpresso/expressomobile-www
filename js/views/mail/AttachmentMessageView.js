define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/home/LoadingView',
  'text!templates/mail/attachmentMessageTemplate.html'
], function($, _, Backbone, Shared, LoadingView, attachmentMessageTemplate){

  var AttachmentMessageView = Backbone.View.extend({

    attachmentID : "",
    attachmentName : "",
    attachmentEncoding : "",
    attachmentIndex : "",
    msgID : "",
    folderID : "",


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

      window.plugins.webintent.saveImage(base64,  {filename:params.attachmentName, overwrite: true}, 
       function(result) {

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
            url: "file://" + result 
          },
            function () {},
            function () {alert('Não foi possível abrir o Arquivo.') }
          );
          
       }, function(error) {
          alert(error);
       });
    
    },

    download: function() {

          var that = this;

          var params = {
            attachmentID : this.attachmentID,
            attachmentName : this.attachmentName,
            attachmentEncoding : this.attachmentEncoding,
            attachmentIndex : this.attachmentIndex,
            msgID : this.msgID,
            folderID : this.folderID,
          };

          Shared.api.resource('/Mail/Attachment').dataType("arraybuffer").params(params).done(function(result){
 
              if (Shared.isPhonegap()) {
                that.downloadPhonegap(params,result);
              } else {
                that.downloadBrowser(params,result);
              }

          }).execute();

    },

    render: function(){

      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      var loadingView = new LoadingView({ el: $(elementID) });
      loadingView.render();

      var that = this;

      var params = {
        attachmentID : this.attachmentID,
        attachmentName : this.attachmentName,
        attachmentEncoding : this.attachmentEncoding,
        attachmentIndex : this.attachmentIndex,
        msgID : this.msgID,
        folderID : this.folderID,
      };

      Shared.api.resource('/Mail/Attachment').dataType("arraybuffer").params(params).done(function(result){

        var newData = {
          fileName: that.attachmentName,
          imageData: 'data:image/png;base64,'+btoa(String.fromCharCode.apply(null, new Uint8Array(result))),
          _: _ 
        };

        var compiledTemplate = _.template( attachmentMessageTemplate, newData );

        that.$el.html(compiledTemplate);

        $(elementID).empty().append(that.$el);
        that.loaded();

      }).execute();
    
    },

    loaded: function () 
    {
      Shared.scrollDetail = new iScroll('wrapperDetail');
    }

  });

  return AttachmentMessageView;
  
});
