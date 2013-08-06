define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/messagesTemplate.html'
], function($, _, Backbone, Shared, messagesTemplate){

  var MessagesView = Backbone.View.extend({

    render: function(){

      var that = this;

      var data = {
        messages: this.collection.models,
        _: _ ,
        Shared: that.Shared
      };

      var compiledTemplate = _.template( messagesTemplate, data );
      $("#scrollerList").html( compiledTemplate ); 

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

//      console.log(e);

      Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});

    }

  });

  return MessagesView;
  
});
