define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsSupportListTemplate.html'
], function($, _, Backbone, Shared, settingsSupportListTemplate){

  var SettingsSupportListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( settingsSupportListTemplate, newData );
      this.$el.html( compiledTemplate ); 

      this.loaded();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsSupportListView;
  
});
