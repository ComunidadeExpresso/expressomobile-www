define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'views/home/LoadingView',
  'text!templates/mail/previewAttachmentMessageTemplate.html'
], function($, _, Backbone, Shared, LoadingView, previewAttachmentMessageTemplate){

  var PreviewAttachmentMessageView = Backbone.View.extend({

    fileID : "",
    fileName: "",
    fileType: "",
    fileSize: "",
    fileData: "",

    render: function(){

      var elementID = "#msgAttachmentsRecipients";

      var newData = {
        fileID: this.fileID,
        fileName: this.fileName,
        fileType: this.fileType,
        fileSize: this.fileSize,
        fileData: this.fileData,
        _: _ 
      };

      var compiledTemplate = _.template( previewAttachmentMessageTemplate, newData );

      this.$el.html(compiledTemplate);

      $(elementID).prepend(this.$el);
    
    },

    events: {
      "click .deleteAttachmentLink" : "deleteAttachment",
    },

    deleteAttachment: function(e) {

      var element = $(e.currentTarget).attr("id");
      var elements = element.split("_");

      var attachID = elements[1];

      Shared.currentDraftMessage.removeFileByID(attachID);

      $("#attach_" + attachID).remove();

    },

  });

  return PreviewAttachmentMessageView;
  
});
