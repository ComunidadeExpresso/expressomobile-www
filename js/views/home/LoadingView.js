define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/home/loadingTemplate.html'
], function($, _, Backbone, Shared, loadingTemplate){

  var LoadingView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( loadingTemplate, newData );
      this.$el.html( compiledTemplate ); 

    },

    loaded: function () 
    {


    }
  });

  return LoadingView;
  
});