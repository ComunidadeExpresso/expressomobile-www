define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'views/home/LoadingView',
	'views/home/HomeView',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
	'models/contacts/ContactModel',
	'collections/contacts/DetailsContactCollection',
	'collections/home/ContextMenuCollection',
], function($, _, Backbone, Shared, LoadingView, HomeView, detailContentTemplate, primaryContentTemplate, ContactModel, DetailsContactCollection, ContextMenuCollection)
{
	var DeleteContactView = Backbone.View.extend(
	{
		contactID: null,

		render: function(data)
		{
			var self = this;
			var contentTitle;
			var container;
			var messageContainer;

			if (!Shared.isSmartPhoneResolution())
			{
				this.$el.html(_.template(detailContentTemplate));
				$('#contentDetail').empty().append(this.$el);

				contentTitle = $('#contentDetailTitle');
				container = $('#scrollerDetail');
				messageContainer = '#messageDetail';
			}
			else
			{
				this.$el.html(_.template(primaryContentTemplate));
				$('#content').empty().append(this.$el);

				contentTitle = $('#contentTitle');
				container = $('#scroller');
				messageContainer = '#message';
			}

			var loadingView = new LoadingView({el: container});	
				loadingView.render();

			var doneDelete = function (data)
			{

				if (data.contact != undefined && Boolean(data.contact.status) == true)
				{
					Shared.router.navigate('/Contacts/Personal/OK', {trigger: true});
				}
				else if (data.error != undefined)
				{
					Shared.router.navigate('/Contacts/Personal/' + self.contactID + '/' + data.error.code, {trigger: true});
				}
			}

			this.deleteContact(this.contactID, doneDelete, doneDelete);
		},

		initialize: function() { },

		loaded: function (pEmail, pContactID) 
		{
			if (!Shared.isSmartPhoneResolution())
			{
				if (Shared.scrollDetail != null) 
				{
					Shared.scrollDetail.destroy();
					Shared.scrollDetail = null;
				}
				Shared.scrollDetail = new iScroll('wrapperDetail');
			}
			else
			{
				if (Shared.scroll != null) 
				{
					Shared.scroll.destroy();
					Shared.scroll = null;
				}
				Shared.scroll = new iScroll('wrapper');
			}

			Shared.scrollerRefresh();
			Shared.menuView.renderContextMenu('detailsContact', { email: pEmail, contactID: pContactID });
		},

		deleteContact: function (pContactID, callbackSucess, callbackFail)
		{
			var contactModel = new ContactModel();
				contactModel.deleteContact({contactID: pContactID})
				.done(function (data) 
				{
					var newData = { contact: data, _: _ };

					if (callbackSucess)
						callbackSucess(newData);
				})
				.fail(function (error) 
				{
					if (callbackFail)
						callbackFail(error);
				});
		}
	});

	return DeleteContactView;
  
});