define([
  'underscore',
  'backbone',
  'shared',
  'models/contacts/ContactModel'
], function (_, Backbone, Shared, ContactModel)
{
	var ContactsListCollection = Backbone.Collection.extend (
	{
		model: ContactModel,
		_data: {},

		_functions : {},

		done: function (value)
		{
			this._functions.done = value;
	        return this;
		},

		fail: function (value)
		{
			this._functions.fail = value;
	        return this;
		},

		initialize: function (models, options)
		{
			this.api = Shared.api;
	        this.model = ContactModel;
		},

		getContactByID: function(contactID) {
			var retVal = false;
	        for (var i in this.models) {
	          if (this.models[i].get('contactID') == contactID) {
	            retVal = this.models[i];
	          }
	        }
	        return retVal;
		},

		getContacts: function (pSearch, pContactType)
		{	
			var that = this;
				that._data = {};

			var thatModel = ContactModel;
			var data = this._data;

			Shared.api
	        .resource('Catalog/Contacts')
	        .params({search:pSearch,contactType:pContactType})
	        .done(function (result)
	        {
		        for (var i in result.contacts) 
	        	{
	        		var thisModel = new thatModel(result.contacts[i]);

        			that.add(thisModel);
	        	}

				if (that._functions.done)
					that._functions.done(that);
	        })
	        .fail( function (error) 
	        {
				if (that._functions.fail) 
					that._functions.fail(error); 
	        })
	        .execute();

	        return that;
		},

		getContactImagePicture: function (pContactID, callback)
		{
			this.api
			.resource('Catalog/ContactPicture')
			.params({contactID:this.pContactID,contactType:'2'})
	        .done(function (result)
	        {
		        callback(_.first(result.contacts).contactImagePicture);
	        })
	        .fail( function (error) 
	        {
				callback("");
	        })
	        .execute();
		},

		execute: function ()
		{
			return this.api.execute();
		}

	});

	return ContactsListCollection;
});