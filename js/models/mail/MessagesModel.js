define([
  'underscore',
  'backbone',
  'shared'
], function(_, Backbone, Shared) {
  
  var MessagesModel = Backbone.Model.extend({

  	// Default attributes for the message.
    defaults: {
        msgID: "",
        folderID: "",
        msgDate: "",
        msgFrom: {
          "fullName": "",
          "mailAddress": ""
        },
        msgTo: [
          {
            "fullName": "",
            "mailAddress": ""
          }
        ],
        msgReplyTo: [
          {
            "fullName": "",
            "mailAddress": ""
          }
        ],
        msgSubject: "",
        msgHasAttachments: "",
        msgFlagged: "",
        msgForwarded: "",
        msgAnswered: "",
        msgDraft: "",
        msgSeen: "",
        msgSize: "",
        msgBodyResume: ""
    },

    initialize: function() {
    	this.api = Shared.api;
    	this.readResource = '/Mail/Messages';
		this.updateResource = '';
		this.createResource = '/Mail/SendMessage';
		this.deleteResource = '/Mail/DelMessage';
    },

    
    route: function() {
      return '/Mail/Messages/' + this.get("msgID") + "/" + this.get("folderID");
    },

    listItemID: function() {
      return 'Mail_Message_ListItem_' + this.get("folderID") + "_" + this.get("msgID");
    }
    
	  // getByID: function(PfolderID,PmsgID) {

	  // 	var that = this;

	  //   this.api
	  //   .resource(this.readResource)
	  //   .params({folderID:PfolderID,msgID:PmsgID,search:'',resultsPerPage:Shared.settings.resultsPerPage,page:1})
	  //   .done(function(result){

	  //     return that.formatResponse(result);

	  //   })
	  //   .execute();
	  // },


	  // delete: function() {

	  // 	var that = this;

	  //   this.api
	  //   .resource(this.deleteResource)
	  //   .params({folderID:this.get("folderID"),msgID:this.get("msgID")})
	  //   .done(function(result){

	  //   	return true;

	  //   })
	  //   .execute();
	  // },

  });

  return MessagesModel;

});
