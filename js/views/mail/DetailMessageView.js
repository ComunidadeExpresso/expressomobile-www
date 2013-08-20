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

    el: $("#contentDetail"),
    folderID: 'INBOX',
    msgID: '',
    search: '',
    page: 1,

    scrollDetail: '',

    render: function(){

      var that = this;

      var elementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        elementID = "#content";
      }

      if (this.msgID) {

        var loadingView = new LoadingView({ el: $(elementID) });
        loadingView.render();

        var messagesData = new MessagesCollection();

        messagesData.getMessagesInFolder(this.folderID,this.msgID,this.search,this.page).done(function(data){

          var data = {
            messages: data.models,
            _: _ ,
            $: $
          };

          var compiledTemplate = _.template( detailMessageTemplate, data );

          $(elementID).html( compiledTemplate ); 

          Shared.menuView.renderContextMenu(1,{folderID: that.folderID, msgID: that.msgID});

          that.loaded();

        }).execute();
      }


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

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');
    }

  });

  return DetailMessageView;
  
});
