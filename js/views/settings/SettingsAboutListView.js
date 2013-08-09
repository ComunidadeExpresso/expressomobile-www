define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsAboutListTemplate.html'
], function($, _, Backbone, Shared, settingsAboutListTemplate){

  var SettingsAboutListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsAboutListTemplate, newData );

      this.$el.html( compiledTemplate ); 

      this.loaded();

    },

    loaded: function () 
    {
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsAboutListView;
  
});
