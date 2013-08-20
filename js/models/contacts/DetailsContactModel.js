define ([
  'underscore',
  'backbone',
  'shared'
], function (_, Backbone, Shared) 
{
	var ContactsListModel = Backbone.Model.extend(
	{
		defaults:
		{
			contactID: '',
	        contactMails: [],
	        contactAlias: "",
	        contactFirstName: "",
	        contactLastName: "",
	        contactFullName: "",
	        contactBirthDate: "",
	        contactNotes: "",
	        contactHasImagePicture: 0
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

		getFirstEmailAddress: function()
		{
			return this.get('contactMails')[0];
		}
	});

	return ContactsListModel;

});