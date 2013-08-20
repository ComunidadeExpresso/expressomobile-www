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
				var queryUID = contactID.split(",")[0]; 
				var uid = queryUID.split("=");
				var id = uid[1].replace(".", "___");

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
			$('.picture_image').html(compiledTemplate);

			this.loaded();			
		},

		initialize: function() { },

		loaded: function () { },

		getContactPictureImage: function (pContactID, callbackSuccess, callbackFail)
		{
			var contactPictureImageModel = new ContactPictureImageModel();
				contactPictureImageModel.getImagePicture(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contact: data, _: _ });
				})
				.fail(function (data) 
				{
					// callbackFail({ error: data.error, _: _ });
				});
		}
	});

	return PictureImageContactView;
  
});