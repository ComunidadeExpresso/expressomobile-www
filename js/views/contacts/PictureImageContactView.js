	define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'views/home/LoadingView',
	'models/contacts/ContactPictureImageModel',
	'text!templates/contacts/pictureImageContactTemplate.html'
], function($, _, Backbone, Shared, LoadingView, ContactPictureImageModel, PictureImageContactTemplate)
{
	var PictureImageContactView = Backbone.View.extend(
	{
		render: function(data)
		{
			var done = function (value)
			{
				var contactID = decodeURIComponent(value.contact.get('contactID'));
				var id;

				if (parseInt(contactID) != NaN && parseInt(contactID) % 1 == 0)
					id = contactID;
				else
				{
					var queryUID = contactID.split(",")[0]; 
					var uid = queryUID.split("=");
					id = uid[1].replace(".", "___");
				}

				$('#picture_contact_' + id + ' img').attr('src', 'data:image/gif;base64,' + value.contact.get('contactImagePicture'));
			}

			for (var i in data.contacts)
			{
				if (data.contacts[i].get('contactHasImagePicture') == 1)
				{
					this.getContactPictureImage(data.contacts[i].get('contactID'), done, done);	
				}
			}

			var compiledTemplate = _.template(PictureImageContactTemplate);
			this.$el.html(compiledTemplate);

			this.loaded();			
		},

		initialize: function() { },

		loaded: function () { },

		getContactPictureImage: function (pContactID, callbackSuccess, callbackFail)
		{
			var pContactType = '2';

			if (parseInt(pContactID) != NaN && parseInt(pContactID) % 1 == 0)
				pContactType = '1';

			var contactPictureImageModel = new ContactPictureImageModel();
				contactPictureImageModel.done(function (data) 
				{
					callbackSuccess({ contact: data, _: _ });
				})
				.fail(function (data) 
				{
					// callbackFail({ error: data.error, _: _ });
				}).getImagePicture(pContactID, pContactType);
		}
	});

	return PictureImageContactView;
  
});