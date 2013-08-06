// Filename: app.js
define([
  'jquery', 
  'underscore', 
  'backbone',
  'shared',
  'router', // Request router.js
], function($, _, Backbone, Shared, AppRouter){
  var initialize = function(){



    var newRouterInstance = AppRouter.initialize();

    Shared.router = newRouterInstance;

    Shared.router.start();

  };

  return { 
    initialize: initialize
  };
});
