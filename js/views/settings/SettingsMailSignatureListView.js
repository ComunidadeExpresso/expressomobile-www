define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsMailSignatureListTemplate.html'
], function($, _, Backbone, Shared, settingsMailSignatureListTemplate){

  var SettingsMailSignatureListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsMailSignatureListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsMailSignatureListView;
  
});
