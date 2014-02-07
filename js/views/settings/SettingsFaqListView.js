define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsFaqListTemplate.html'
], function($, _, Backbone, Shared, settingsFaqListTemplate){

  var SettingsFaqListView = Backbone.View.extend({

    el: $("#content"),

    render: function(){

      var that = this;

      var newData = {
          _: _ 
      };

      var compiledTemplate = _.template( settingsFaqListTemplate, newData );

      that.$el.html( compiledTemplate ); 

      that.loaded();

    },

    loaded: function () 
    {
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return SettingsFaqListView;
  
});
