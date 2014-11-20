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
	var AddContactView = Backbone.View.extend(
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

			var done = function (data)
			{
				var doneAdd = function (data)
				{
					if (data.contact == true)
					{
						Shared.router.navigate('/Contacts/General/' + self.contactID + '/OK', {trigger: true});
					}
					else if (data.error != undefined)
					{
						Shared.router.navigate('/Contacts/General/' + self.contactID + '/' + data.error.code, {trigger: true});
					}

				}

				var contact = _.first(data.contacts);
				var phoneNumber = contact.get('contactPhones') != '' && contact.get('contactPhones').length > 0 ? contact.get('contactPhones')[0] : '';
				var attrs = {
					contactAlias: contact.get('contactFullName'),
					contactGivenName: contact.get('contactFirstName'),
					contactFamilyName: contact.get('contactLastName'),
					contactEmail: contact.get('contactMails')[0],
					contactPhone: phoneNumber,
				}

				self.addContact(attrs, doneAdd, doneAdd);
			}

			this.getContactDetails(this.contactID, done, done)
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

		getContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getGeneralContactDetails(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		addContact: function (params, callbackSucess, callbackFail)
		{
			var contactModel = new ContactModel();
				contactModel.addContact(params)
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

	return AddContactView;
  
});