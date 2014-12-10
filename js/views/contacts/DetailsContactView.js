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
				messageContainer = '#pageMessage';
			}
			else
			{
				this.$el.html(_.template(primaryContentTemplate));
				$('#content').empty().append(this.$el);

				contentTitle = $('#contentTitle');
				container = $('#scroller');
				messageContainer = '#pageMessage';
			}

			var loadingView = new LoadingView({el: container});	
				loadingView.render();

			var done = function (data)
			{
				var firstContact = _.first(data.contacts);
				if (firstContact != undefined) {
					contentTitle.text(firstContact.get('contactFullName'));
				
					var contact = {contact: _.first(data.contacts), _: _};
					var contactID = self.secondViewName == 'Personal' ? _.first(data.contacts).get('contactID') : _.first(data.contacts).get('contactUIDNumber');

					container.empty().append(_.template(DetailsContactTemplate, contact));
					self.loaded((_.first(data.contacts).get('contactMails'))[0], contactID);

					var pictureImageContactView = new PictureImageContactView({el: $('.details_picture_image')});
						pictureImageContactView.render(data);

					$('.details_picture_image').css('margin', '0 10px');
					$('.details_picture_image img').css('width', '80px').css('height', '106px');
					$('.details_picture_image img').css('margin-top', '10px').css('background-size', '110px 130px');

				}

				if (self.status == 'OK')
				{
					var message = '';

					if (self.secondViewName == 'Personal')
						message = 'Contato removido do catálogo pessoal com sucesso.';
					else
						message = 'Contato adicionado ao catálogo pessoal com sucesso.';

					Shared.showMessage({
							type: "success",
							icon: 'icon-agenda',
							title: message,
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

						case '1056':
							error = 'Erro ao excluir o contato. O ID  está vazio ou é inválido.';
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
			Shared.menuView.renderContextMenu('detailsContact', { email: pEmail, contactID: pContactID, contactType: this.secondViewName });
		},

		getPersonalContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				}).getPersonalContactDetails(pContactID);
		},

		getGeneralContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				}).getGeneralContactDetails(pContactID);
		}
	});

	return DetailsContactView;
  
});