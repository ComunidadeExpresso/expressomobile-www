define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'text!templates/master/primaryContentTemplate.html',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/contacts/generalContactsListTemplate.html',
	'text!templates/contacts/personalContactsListTemplate.html',
	'collections/home/ContextMenuCollection',
	'views/contacts/PictureImageContactView',
	'views/home/LoadingView',
	'views/home/HomeView',
	'collections/contacts/ContactsListCollection',
], function($, _, Backbone, Shared, primaryContentTemplate, detailContentTemplate, GeneralContactsListTemplate, PersonalContactsListTemplate, ContextMenuCollection, PictureImageContactView, LoadingView, HomeView, ContactsListCollection)
{
	var ContactsListView = Backbone.View.extend(
	{
		searchLength: 0,
		secondViewName: '',
		currentView: null,
		arrayContacts: {},

		events: 
		{
			"keyup .personalContacts .searchField": "searchPersonalContacts",
			"keypress .generalContacts .searchField": "searchGeneralContacts",
			"click #contactsList a": "viewContact"
		},

		render: function()
		{
			this.$el.html(_.template(primaryContentTemplate));
			$('#content').empty().append(this.$el);

			if (!Shared.isSmartPhoneResolution())
			{
				$('#contentDetail').html(_.template(detailContentTemplate));
				$('#contentDetail .searchArea').remove();
				$('#contentDetailTitle').text('Exibir contato');

				Shared.showMessage({
					type: "chat-message",
					icon: 'icon-contacts',
					title: "Selecione um contato para exibir as informações",
					route: "",
					description: "",
					timeout: 0,
					animate: false,
					elementID: "#messageDetail",
				});
			}

			var loadingView = new LoadingView({el: $('#scroller')});	
				loadingView.render();

			if (this.secondViewName == 'General')
				this.listGeneralContacts('');
			else 
				this.listPersonalContacts('');
		},

		initialize: function() { },

		loaded: function () 
		{
			var top = $('.top').outerHeight(true);
			var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);

			$('#wrapper').css('top', top + search);

			if (Shared.scroll != null) 
			{
				Shared.scroll.destroy();
				Shared.scroll = null;
			}

			Shared.scroll = new iScroll('wrapper');
			Shared.scrollerRefresh();

			if (this.secondViewName == 'General')
				Shared.menuView.renderContextMenu('generalContacts', {});
			else
				Shared.menuView.renderContextMenu('personalContacts', {});
		},

		searchPersonalContacts: function (e)
		{
			this.searchContacts(e, $('.searchField').val(), '1');
		},

		searchGeneralContacts: function (e)
		{
			if (e.keyCode == 13)
				this.searchContacts(e, $('.searchField').val(), '2');
		},

		searchContacts: function (e, pSearch, pContactType)
		{
			var search = $('.searchField').val();
			var pSearch = '';

			// Define o parâmetro da busca
			if (search.length >= 3)
				pSearch  = search;
			else
				pSearch = '';
			
			// Define se precisa fazer a busca ou não
			if (pSearch.length >= 3 || this.searchLength >=3)
			{
				var loadingView = new LoadingView({el: $('#scroller')});
				loadingView.render();

				if (pContactType == '1')
					this.listPersonalContacts(pSearch);
				else
					this.listGeneralContacts(this.removeAccents(pSearch));
			}

			this.searchLength = search.length
		},

		listPersonalContacts: function (pSearch)
		{
			var self = this;

			$('#contentTitle').text('Contatos Pessoais');
			$('.searchArea').removeClass('generalContacts');
			$('.searchArea').addClass('personalContacts');
			
			var donePersonalContacts = function (data)
			{
				if (data.error == undefined) 
				{
					if (data.contacts.length > 0) 
					{
						$('#message').empty();
						$('#scroller').empty().append(_.template(PersonalContactsListTemplate, data));
					} 
					else 
					{
						Shared.showMessage({
				            type: "error",
				            icon: 'icon-contacts',
				            title: "Nenhum Resultado Encontrado.",
				            route: "",
				            description: "",
				            timeout: 0,
				            elementID: "#message",
				        });

				        $('#scroller').empty()
					}
				} 
				else 
				{
					$('#scroller').empty()
					Shared.handleErrors(data.error);					
				}

				self.setElement(self.$el);
				self.loaded();
			};

			this.listContacts(pSearch, '1', donePersonalContacts, donePersonalContacts);
		},

		listGeneralContacts: function (pSearch)
		{
			var self = this;

			this.personalContact = false;

			$('#contentTitle').text('Catálogo Geral');
			$('.searchArea').removeClass('personalContacts');
			$('.searchArea').addClass('generalContacts');

			var doneGeneralContacts = function (data)
			{
				if (data.error == undefined) 
				{
					$('#message').empty();
					$('#scroller').empty().append(_.template(GeneralContactsListTemplate, data));
				} 
				else 
				{
					if (data.error.code == "1001") 
					{
						Shared.showMessage({
							type: "chat-message",
							icon: 'icon-contacts',
							title: "Sua busca deve ser específica.",
							route: "",
							description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
							timeout: 0,
							animate: false,
							elementID: "#message",
						});
			        }

			        if (data.error.code == "1019") 
			        {
						Shared.showMessage({
							type: "error",
							icon: 'icon-contacts',
							title: "Nenhum Resultado Encontrado.",
							route: "",
							description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
							timeout: 0,
							animate: false,
							elementID: "#message",
						});
			        }

			        $('#scroller').empty();
				}

				var pictureImageContactView = new PictureImageContactView({el: $('.picture_image')});
				pictureImageContactView.render(data);

				self.setElement(self.$el);
				self.loaded();
			};

			this.listContacts(pSearch, '2', doneGeneralContacts, doneGeneralContacts);
		},

		listContacts: function (pSearch, ptype, callbackSuccess, callbackFail)
		{
			var contactsData = new ContactsListCollection();
				contactsData.getContacts(pSearch, ptype)
				.done(function (data) 
				{
					this.arrayContacts = { contacts: data.models, search: pSearch, _: _ };

					callbackSuccess(this.arrayContacts);
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		viewContact: function(e)
		{
			e.preventDefault();

			$('#contactsList ul li').removeAttr('class');
			$(e.target).parents('li').addClass('selected');

			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		},

		removeAccents: function(strAccents) 
		{
			var strAccents = strAccents.split('');
			var strAccentsOut = new Array();
			var strAccentsLen = strAccents.length;
			var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
			var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";

			for (var y = 0; y < strAccentsLen; y++) 
			{
				if (accents.indexOf(strAccents[y]) != -1) 
					strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
				else
					strAccentsOut[y] = strAccents[y];
			}

			strAccentsOut = strAccentsOut.join('');

			return strAccentsOut;
        },
	});

	return ContactsListView;
});