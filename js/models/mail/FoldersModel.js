define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var FoldersModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        folderName: "",
        folderParentID: "",
        folderHasChildren: 0,
        qtdUnreadMessages: 0,
        qtdMessages: 0,
        folderID: "INBOX",
        folderType: 0,
        diskSizeUsed: "",
        diskSizePercent: 0
    },

    initialize: function() {
    	this.api = Shared.api;
    },

    
    route: function() {
      return '/Mail/Messages/1/0/' + this.get("folderID") + '#';
    },

    


  });

  return FoldersModel;

});
