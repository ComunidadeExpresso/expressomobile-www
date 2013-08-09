define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/messagesListItemsTemplate.html'
], function($, _, Backbone, Shared, messagesListItemsTemplate){

  var MessagesListItemsView = Backbone.View.extend({

    render: function(nextPage){

      var that = this;

      var data = {
        messages: this.collection.models,
        _: _ 
      };

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

      parent.addClass("selected");

      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    }

  });

  return MessagesListItemsView;
  
});
