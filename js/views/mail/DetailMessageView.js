define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/MessagesCollection',
  'text!templates/mail/detailMessageTemplate.html'
], function($, _, Backbone, Shared,MessagesCollection, detailMessageTemplate){

  var DetailMessageView = Backbone.View.extend({

    el: $("#scrollerDetail"),
    folderID: 'INBOX',
    msgID: '',
    search: '',
    page: 1,

    scrollDetail: '',

    render: function(){

      var that = this;

      if (this.msgID) {
        var messagesData = new MessagesCollection();

        messagesData.getMessagesInFolder(this.folderID,this.msgID,this.search,this.page).done(function(data){

          var data = {
            messages: data.models,
            _: _ 
          };

          var compiledTemplate = _.template( detailMessageTemplate, data );

          $("#scrollerDetail").html( compiledTemplate ); 

          that.loaded();

        }).execute();
      }


    },

    loaded: function () {

      if (Shared.scrollDetail != null) {
        Shared.scrollDetail.destroy();
        Shared.scrollDetail = null;
      }

        console.log('DetailMessageLoaded()');

        var top = $('.top').outerHeight(true);
        var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);

        //refreshDotDotDot();

        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);

        var that = this;
        Shared.scrollDetail = new iScroll('wrapperDetail');
    }

  });

  return DetailMessageView;
  
});
