define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var MenuItemModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        menuTitle: "",
        menuRoute: "",
        menuClass: "",
        menuIconClass: "",
        menuHasBadge: false,
    },

    initialize: function() {

    },


  });

  return MenuItemModel;

});
