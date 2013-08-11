define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var ContextMenuModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        route: "",
        title: "",
        iconClass: "",
    },

    initialize: function() {

    },

  });

  return ContextMenuModel;

});
