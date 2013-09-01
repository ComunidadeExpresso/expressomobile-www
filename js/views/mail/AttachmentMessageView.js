define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/attachmentMessageTemplate.html'
], function($, _, Backbone, Shared, attachmentMessageTemplate){

  var AttachmentMessageView = Backbone.View.extend({

    attachmentID : "",
    attachmentName : "",
    attachmentEncoding : "",
    attachmentIndex : "",
    msgID : "",
    folderID : "",

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

        var name = that.attachmentName;
        var url = URL.createObjectURL(new Blob([result]));
        var link = document.createElement("a");
        link.setAttribute("href",url);
        link.setAttribute("download",name);
        $('body').append(link);
        var event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(event);
        $(link).trigger('click');

      }).execute();

    },

    render: function(){

      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

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
