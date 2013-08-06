define(['underscore', 'backbone'], function(_, Backbone){

// A simple module to replace `Backbone.sync` with *expressoAPI*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.


// Our Store is represented by a single JS object in *expressoAPI*. Create it
// with a meaningful name, like the name you'd give a table.
var ApiSync = function(expressoAPI) {
  this.api = expressoAPI;
};

_.extend(ApiSync.prototype, {

  // Save the current state of the **Store** to *localStorage*.

  execute: function() {
    this.api.execute();
  },

});

// Override `Backbone.sync` to use delegate to the model or collection's
Backbone.sync = function(method, model, options) {

  var resp;
  var api = model.api || model.collection.api;

  switch (method) {
    case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
    case "create":  resp = store.create(model);                            break;
    case "update":  resp = store.update(model);                            break;
    case "delete":  resp = store.destroy(model);                           break;
  }

  if (resp) {
    options.success(resp);
  } else {
    options.error("Record not found");
  }
};
return ApiSync;
});
