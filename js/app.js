// Filename: app.js
define([
  'jquery', 
  'underscore', 
  'backbone',
  'shared',
  'router', // Request router.js
], function($, _, Backbone, Shared, AppRouter){
  var initialize = function(){


    Shared.router = new AppRouter();

    Shared.router.setupRouter();

    Shared.router.start();

  };

  return { 
    initialize: initialize
  };
});
