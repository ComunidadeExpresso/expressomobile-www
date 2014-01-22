define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'text!templates/mail/detailMessageTemplate.html',
  'views/home/LoadingView',
  'collections/home/ContextMenuCollection',
  'views/mail/PreviewAttachmentMessageView',
], function($, _, Backbone, Shared,MessagesCollection, detailMessageTemplate, LoadingView,ContextMenuCollection,PreviewAttachmentMessageView){

  var DetailMessageView = Backbone.View.extend({

    folderID: 'INBOX',
    msgID: '',
    search: '',
    page: 1,

    scrollDetail: '',

    render: function(){

      var elementID = "#contentDetail";

      if (Shared.isSmartPhoneResolution()) {
        elementID = "#content";
      }

      this.$el.html("");

      var that = this;

      if (this.msgID) {

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var messagesData = new MessagesCollection();

        messagesData.getMessagesInFolder(this.folderID,this.msgID,this.search,this.page).done(function(data){

          var message = data.models[0];

          var qtdMessages = data.models.length;

          var data = {
            messages: data.models,
            _: _ ,
            Shared: Shared,
            $: $
          };

          var compiledTemplate = _.template( detailMessageTemplate, data );

          that.$el.html(compiledTemplate);

          $(elementID).empty().append(that.$el);

          that.renderAttachments(message);

          var folderType = 5;
          if (Shared.folders != undefined) {
            var currentFolder = Shared.folders.getFolderByID(that.folderID);
          
            if (currentFolder.get != undefined) {
              folderType = currentFolder.get("folderType");
            }
          }

          Shared.menuView.renderContextMenu('detailMessage',{folderID: that.folderID, msgID: that.msgID, folderType: folderType, qtdMessages: qtdMessages });

          that.loaded();

        }).fail(function(result){
              
          Shared.handleErrors(result.error);

          $(elementID).empty();
          
          return false;
        }).execute();
      }

    },

    renderAttachments: function(message) {

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

          preview.previewType = 'detailmessage';

          preview.render();
        }

      }
    },

    events:
    {
      'click .attachmentLink': 'openAttachment',
      'click .showMoreMsgTo' : 'showMoreMsgTo',
      'click .showMoreMsgCc' : 'showMoreMsgCc',
      
    },

    showMoreMsgTo: function(e) { 
      $(".detailMsgTo").removeClass("hidden");
      $(".showMoreMsgTo").addClass("hidden");
      this.loaded();
    },

    showMoreMsgCc: function(e) { 
      $(".detailMsgCc").removeClass("hidden");
      $(".showMoreMsgCc").addClass("hidden");
      this.loaded();
    },

    openAttachment: function(e) {
      e.preventDefault();
      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
    },


    loaded: function () {

      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.destroy();
        Shared.scrollDetail = null;
      }

      var top = $('.topHeader').outerHeight(true);
      var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
      
      $('body').height($(window).height() - top);
      $('#wrapper').css('top', top + search);

      var contentBodyWidth = $("#contentMessageBody").width();
      var contentDetailWidth = $("#contentDetail").width();

      if ((contentBodyWidth + 15) >= contentDetailWidth) {
        $("#scrollerDetail").width(contentBodyWidth + 10);
      }

      Shared.scrollDetail = new iScroll('wrapperDetail',{vScroll:true, hScroll:true, hScrollBar: true, vScrollBar: true, zoom: true });

      Shared.refreshDotDotDot();
      Shared.scrollerRefresh();

    }

  });

  return DetailMessageView;
  
});
