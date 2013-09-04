define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'text!templates/mail/detailMessageTemplate.html',
  'views/home/LoadingView',
  'collections/home/ContextMenuCollection',
], function($, _, Backbone, Shared,MessagesCollection, detailMessageTemplate, LoadingView,ContextMenuCollection){

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

          var data = {
            messages: data.models,
            _: _ ,
            Shared: Shared,
            $: $
          };

          var compiledTemplate = _.template( detailMessageTemplate, data );

          that.$el.html(compiledTemplate);

          $(elementID).empty().append(that.$el);

          Shared.menuView.renderContextMenu(1,{folderID: that.folderID, msgID: that.msgID});

          that.loaded();

        }).execute();
      }

    },

    events:
    {
      'click .attachmentLink': 'openAttachment'
    },

    openAttachment: function(e) {
      // console.log('openAttachment');
      // console.log(e.currentTarget.getAttribute("href"));
      e.preventDefault();
      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
    },


    loaded: function () {

      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.destroy();
        Shared.scrollDetail = null;
      }

      var top = $('.top').outerHeight(true);
      var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
      
      $('body').height($(window).height() - top);
      $('#wrapper').css('top', top + search);

      Shared.scrollDetail = new iScroll('wrapperDetail',{vScroll:true, hScroll:true, hScrollBar: true, vScrollBar: true });


      Shared.refreshDotDotDot();
      Shared.scrollerRefresh();

    }

  });

  return DetailMessageView;
  
});
