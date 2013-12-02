define ([
  'underscore',
  'backbone',
  'shared'
], function (_, Backbone, Shared) 
{
	var ContactPictureImageModel = Backbone.Model.extend(
	{
		defaults:
		{
			contactID: '',
	        contactImagePicture: ''
		},

		initialize: function ()
		{
			this.api = Shared.api;
			this.readResource = '/Catalog/ContactPicture';
			this.updateResource = '';
			this.createResource = '';
			this.deleteResource = '';
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

		getImagePicture: function (pContactID, pContactType)
		{
			var that = this;

			this.api
			.resource('Catalog/ContactPicture')
			.params({contactID:pContactID,contactType:pContactType})
	        .done(function (result)
	        {
	        	var thisModel = new ContactPictureImageModel(result.contacts[0]);

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

		execute: function ()
		{
			return this.api.execute();
		}

	});

	return ContactPictureImageModel;

});