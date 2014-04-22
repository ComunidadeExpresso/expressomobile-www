define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/settings/settingsFaqListTemplate.html'
], function($, _, Backbone, Shared, settingsFaqListTemplate){

  var SettingsFaqListView = Backbone.View.extend({

    elementID: "#content",

    render: function(){

      var that = this;

      var newData = {
          _: _ ,
          elementID: this.elementID,
          Shared: Shared
      };

      var compiledTemplate = _.template( settingsFaqListTemplate, newData );

      this.$el.html(compiledTemplate);
      this.$el.css("width","100%");
      this.$el.css("height","100%");
      $(this.elementID).empty().append(this.$el);

      that.loaded();

    },

    loaded: function () 
    {
      Shared.scrollDetail = new iScroll('wrapperDetail');

    },

    events: {
      'click #btn-back' : 'backButton',
    },

    backButton: function(e) {
      if (e != undefined) {
        e.preventDefault();
      }
      Shared.router.navigate("/",{ trigger: true });
    },

  });

  return SettingsFaqListView;
  
});
