define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsChangePasswordListTemplate.html'
], function($, _, Backbone, Shared, settingsChangePasswordListTemplate){

  var SettingsChangePasswordListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsChangePasswordListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsChangePasswordListView;
  
});
