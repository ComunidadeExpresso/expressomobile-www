define ([
  'underscore',
  'backbone',
  'shared'
], function (_, Backbone, Shared) 
{
	var ContactModel = Backbone.Model.extend(
	{
		defaults:
		{
			contactID: '',
	        contactMails: [],
	        contactPhones: [],
	        contactAlias: "",
	        contactFirstName: "",
	        contactLastName: "",
	        contactFullName: "",
	        contactBirthDate: "",
	        contactNotes: "",
	        contactHasImagePicture: 0,
	        contactImagePicture: ""
		},

		initialize: function ()
		{
			this.api = Shared.api;
			this.readResource = '/Catalog/Contacts';
			this.updateResource = '';
			this.createResource = '';
			this.deleteResource = '';
		},

		route: function() 
		{
			return '/Contacts';
		},

		execute: function ()
		{
			return this.api.execute();
		},

		getFirstEmailAddress: function()
		{
			return this.get('contactMails')[0];
		}
	});

	return ContactModel;

});