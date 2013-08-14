define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var ExpressoModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        auth: "",
        profile: {},
    },

    initialize: function() {

    },

  });

  return ExpressoModel;

});
