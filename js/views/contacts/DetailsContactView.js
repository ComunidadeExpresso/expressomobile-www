define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'views/home/LoadingView',
	'views/home/HomeView',
	'views/contacts/PictureImageContactView',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
	'text!templates/contacts/detailsContactTemplate.html',
	'collections/contacts/DetailsContactCollection',
	'collections/home/ContextMenuCollection',
	'models/contacts/ContactPictureImageModel',
], function($, _, Backbone, Shared, LoadingView, HomeView, PictureImageContactView, detailContentTemplate, primaryContentTemplate, DetailsContactTemplate, DetailsContactCollection, ContextMenuCollection, ContactPictureImageModel)
{
	var DetailsContactView = Backbone.View.extend(
	{
		secondViewName: '',
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
				contentTitle.text(_.first(data.contacts).get('contactFullName'));

				var contact = {contact: _.first(data.contacts), _: _};

				container.empty().append(_.template(DetailsContactTemplate, contact));

				self.loaded((_.first(data.contacts).get('contactMails'))[0]);			

				var pictureImageContactView = new PictureImageContactView({el: $('.details_picture_image')});
					pictureImageContactView.render(data);

				$('.details_picture_image').css('margin', '0 10px');
				$('.details_picture_image img').css('width', '80px').css('height', '106px');
			}

			if (this.secondViewName == 'Personal')
				this.getPersonalContactDetails(this.contactID, done, done)
			else
				this.getGeneralContactDetails(this.contactID, done, done)
		},

		initialize: function() { },

		loaded: function (pEmail) 
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
			Shared.refreshDotDotDot();
			Shared.menuView.renderContextMenu('detailsContact', { email: pEmail });
		},

		getContactDetails: function (pContactID, pContactType, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getContactDetails(pContactID, pContactType)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		getPersonalContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getPersonalContactDetails(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		getGeneralContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getContactDetails(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		}
	});

	return DetailsContactView;
  
});