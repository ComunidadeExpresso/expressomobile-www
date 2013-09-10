define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/messagesListItemsTemplate.html'
], function($, _, Backbone, Shared, messagesListItemsTemplate){

  var MessagesListItemsView = Backbone.View.extend({

    parentFolders : [],

    render: function(nextPage){

      var that = this;

      var data = {
        parentFolders: this.parentFolders,
        messages: this.collection.models,
        _: _ 
      };

      console.log("parentFolders");
      console.log(that.parentFolders);

      var compiledTemplate = _.template( messagesListItemsTemplate, data );
      if (nextPage) {
        $("#scrollerList").append( compiledTemplate );
      } else {
        $("#scrollerList").html( compiledTemplate );
      }

    },

    events: {
      "click a.listItemLink": "selectListItem"
    },

    selectListItem: function(e){

      e.preventDefault();

      $('#scrollerList li').each(function() { 
        if ($(this).hasClass('listDivision').toString() == 'false') {
          $(this).removeClass( 'selected' ); 
        }
      }); 

      var parent = $(e.target).parent();

      if (parent.hasClass("listItemLink")) {
        parent = parent.parent();
      }

      parent.addClass("selected");

      var elementID = $(parent).attr("id");

      $("#" +elementID + "_unread").removeClass("msg-unread");

      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    }

  });

  return MessagesListItemsView;
  
});
