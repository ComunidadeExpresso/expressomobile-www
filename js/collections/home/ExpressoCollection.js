define([
  'underscore', 
  'backbone', 
  'libs/backbone/localstorage', 
  'models/home/ExpressoModel',
  ], function(_, Backbone, Store, ExpressoModel){
	  
	var ExpressoCollection = Backbone.Collection.extend({

    model: ExpressoModel,

    localStorage: new Store("Expresso"),

  });
  return new ExpressoCollection;
});
