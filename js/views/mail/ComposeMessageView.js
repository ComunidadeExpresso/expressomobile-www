define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/composeMessageTemplate.html',
  'collections/home/ContextMenuCollection',
], function($, _, Backbone, Shared, composeMessageTemplate,ContextMenuCollection){

  var ComposeMessageView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var elementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        elementID = "#content";
      }

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( composeMessageTemplate, newData );
      $(elementID).html( compiledTemplate ); 


      Shared.menuView.renderContextMenu(2,{});

    },

    loaded: function () 
    {


    }
  });

  return ComposeMessageView;
  
});