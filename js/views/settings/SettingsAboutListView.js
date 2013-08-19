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

      var that = this;

      Shared.api.resource('/ExpressoVersion').params({}).done(function(result){

        var newData = {
          expressoVersion: result.expressoVersion,
          apiVersion: result.apiVersion,
          appVersion: Shared.appVersion,
          _: _ 
        };

        var compiledTemplate = _.template( settingsAboutListTemplate, newData );

        that.$el.html( compiledTemplate ); 

        that.loaded();

      }).execute();
      
    },

    loaded: function () 
    {
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsAboutListView;
  
});
