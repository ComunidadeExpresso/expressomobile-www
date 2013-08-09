define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var MessagesModel = Backbone.Model.extend({

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
    	this.readResource = '/Mail/Folders';
		  this.updateResource = '/Mail/RenameFolder';
		  this.createResource = '/Mail/AddFolder';
		  this.deleteResource = '/Mail/DelFolder';
    },

    
    route: function() {
      return '/Mail/Folders/' + this.get("folderID");
    },

    listItemID: function() {
      //return 'Mail_Message_ListItem_' + this.get("folderID") + "_" + this.get("msgID");
    }
    


  });

  return MessagesModel;

});
