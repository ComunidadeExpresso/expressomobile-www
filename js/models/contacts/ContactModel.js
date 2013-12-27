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
	        contactImagePicture: "",
		},

		initialize: function ()
		{
			this.api = Shared.api;
			this.readResource = '/Catalog/Contacts';
			this.updateResource = '';
			this.createResource = '';
			this.deleteResource = '';
		},

		getSearchString: function() {

			var retVal =  this.get('contactFirstName') + " " + this.get('contactLastName')  + " &lt;" + this.getFirstEmailAddress() + "&gt;";
			return retVal;
		},

		getEmailString: function() {

			var retVal =  "\"" + this.get('contactFirstName') + " " + this.get('contactLastName') + "\""  + " <" + this.getFirstEmailAddress() + "> ,";
			return retVal;
		},

		route: function() 
		{
			return '/Contacts';
		},

		execute: function ()
		{
			return this.api.execute();
		},

		done: function (value)
		{
			this.done = value;

			return this;
		},

		fail: function (value)
		{
			this.fail = value;

			return this;
		},

		getPersonalContact: function(pContactID)
		{	
			var that = this;

			this.api
	        .resource('Catalog/Contacts')
	        .params({contactID:pContactID,contactType:'1'})
	        .done(function (result)
	        {
				var thisModel = new ContactModel(result.contacts[0]);
	        		that.set(thisModel);

				if (that.done)
	        		that.done(thisModel);
	        })
	        .fail( function (error) 
	        {
				if (that.fail)
	        		that.fail(error); 
	        })
	        .execute();

	        return that;
		},

		getFirstEmailAddress: function()
		{
			return this.get('contactMails')[0];
		},

		addContact: function (params)
		{
			var that = this;

			this.api
			.resource('Catalog/ContactAdd')
			.params(params)
			.done(function (result)
			{
				if (that.done)
	        		that.done(result);
			})
			.fail( function (error) 
			{
				if (that.fail)
		        		that.fail(error);
			})
			.execute();

			return that;
		},

		deleteContact: function (params)
		{
			var that = this;

			this.api
			.resource('Catalog/ContactDelete')
			.params(params)
			.done(function (result)
			{
				if (that.done)
	        		that.done(result);
			})
			.fail( function (error) 
			{
				if (that.fail)
		        		that.fail(error);
			})
			.execute();

			return that;
		}
	});

	return ContactModel;

});