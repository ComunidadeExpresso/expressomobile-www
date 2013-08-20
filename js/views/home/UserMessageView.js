define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/home/userMessageTemplate.html'
], function($, _, Backbone, Shared, userMessageTemplate){

  var UserMessageView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( userMessageTemplate, newData );
      this.$el.html( compiledTemplate ); 

    },

    loaded: function () 
    {


    }
  });

  return UserMessageView;
  
});