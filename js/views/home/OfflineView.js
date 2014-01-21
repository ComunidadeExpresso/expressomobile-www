define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/home/offlineTemplate.html'
], function($, _, Backbone, Shared, offlineTemplate){

  var OfflineView = Backbone.View.extend({

    el: $("#mainAppPageContent"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( offlineTemplate, newData );
      this.$el.html( compiledTemplate ); 

    },

  });

  return OfflineView;
  
});