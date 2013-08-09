define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsResultsPerPageListTemplate.html'
], function($, _, Backbone, Shared, settingsResultsPerPageListTemplate){

  var SettingsResultsPerPageListView = Backbone.View.extend({

  	el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsResultsPerPageListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsResultsPerPageListView;
  
});
