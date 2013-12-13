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
		status: null,

		render: function(data)
		{
			console.log(this.status);

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
				var contactID = this.secondViewName == 'Personal' ? _.first(data.contacts).get('contactID') : _.first(data.contacts).get('contactUIDNumber');

				container.empty().append(_.template(DetailsContactTemplate, contact));
				self.loaded((_.first(data.contacts).get('contactMails'))[0], contactID);

				var pictureImageContactView = new PictureImageContactView({el: $('.details_picture_image')});
					pictureImageContactView.render(data);

				$('.details_picture_image').css('margin', '0 10px');
				$('.details_picture_image img').css('width', '80px').css('height', '106px');

				if (self.status == 'OK')
				{
					Shared.showMessage({
							type: "success",
							icon: 'icon-agenda',
							title: 'Contato adicionado ao catálogo pessoal com sucesso.',
							description: '',
							timeout: 3000,
							elementID: messageContainer
						});
				}
				else if (!isNaN(parseInt(self.status)))
				{
					var error = '';
					switch (self.status)
					{
						case '1052':
						case '1055':
							error = 'Endereço de e-mail inválido.';
							break;

						case '1053':
							error = 'Contato já existe no catálogo pessoal.';
							break;

						default:
						case '1054':
							error = 'Não foi possível adicionar o contato no catálogo pessoal. Por favor, tente novamente.';
							break;
					}

					Shared.showMessage({
						type: "error",
						icon: 'icon-agenda',
						title: error,
						description: '',
						timeout: 3000,
						animate: false,
						elementID: messageContainer
					});
				}
			}

			if (this.secondViewName == 'Personal')
				this.getPersonalContactDetails(this.contactID, done, done)
			else
				this.getGeneralContactDetails(this.contactID, done, done)
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

			$('#contentDetail .searchArea').remove();

			Shared.scrollerRefresh();
			Shared.refreshDotDotDot();
			Shared.menuView.renderContextMenu('detailsContact', { email: pEmail, contactID: pContactID, contactType: this.secondViewName });
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
				detailsContactCollection.getGeneralContactDetails(pContactID)
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