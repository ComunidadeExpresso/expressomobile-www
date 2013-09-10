define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'text!templates/contacts/contactsListTemplate.html',
	'text!templates/contacts/generalContactsListTemplate.html',
	'text!templates/contacts/personalContactsListTemplate.html',
	'collections/home/ContextMenuCollection',
	'views/contacts/PictureImageContactView',
	'views/home/LoadingView',
	'views/home/HomeView',
	'collections/contacts/ContactsListCollection',
], function($, _, Backbone, Shared, ContactsListTemplate, GeneralContactsListTemplate, PersonalContactsListTemplate, ContextMenuCollection, PictureImageContactView, LoadingView, HomeView, ContactsListCollection)
{
	var ContactsListView = Backbone.View.extend(
	{
		el: $("#mainAppPageContent"),
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
			var that = this;
			var primaryElementID = "#content";
			var detailElementID = "#contentDetail";
			var data = { _: _ };

			$(detailElementID).html("");

			if (Shared.isSmartPhoneResolution())
				detailElementID = "#content";

			var compiledTemplate = _.template(ContactsListTemplate, data);
			$(primaryElementID).html(compiledTemplate);

			var loadingView = new LoadingView({el: $('#scroller')});
				loadingView.render();

			if (this.secondViewName == 'General') 
				this.listGeneralContacts('');
			else 
				this.listPersonalContacts('');

			Shared.menuView.renderContextMenu(3,{});

			this.loaded();			
		},

		initialize: function() 
		{
			this.secondViewName = "Personal";
		},

		loaded: function () 
		{
			var that = this;
			Shared.scroll = new iScroll('wrapper');

			var homeView = new HomeView();
			homeView.refreshWindow();
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
			$('#contentTitle').text('Contatos Pessoais');
			$('#page').removeClass('generalContacts');
			$('#page').addClass('personalContacts');
			$('body').off('keypress', '.generalContacts .searchField');
			
			var donePersonalContacts = function (data)
			{
		
				if (data.contacts.length > 0) {
					var template = _.template(PersonalContactsListTemplate, data);
					$('#scroller').html(template);
				} else {
					Shared.showMessage({
			            type: "error",
			            icon: 'icon-contacts',
			            title: "Nenhum Resultado Encontrado.",
			            route: "",
			            description: "",
			            timeout: 0,
			            elementID: "#scroller",
			        });
				}

				Shared.refreshDotDotDot();
				Shared.scrollerRefresh();
			};

			this.listContacts(pSearch, '1', donePersonalContacts, donePersonalContacts);
		},

		listGeneralContacts: function (pSearch)
		{
			this.personalContact = false;

			$('#contentTitle').text('Catálogo Geral');
			$('#page').removeClass('personalContacts');
			$('#page').addClass('generalContacts');
			$('body').off('keyup', '.personalContacts .searchField');

			var doneGeneralContacts = function (data)
			{

				if (data.error == undefined) {
					var template = _.template(GeneralContactsListTemplate, data);
					$('#scroller').html(template);
				} else {

					if (data.error.code == "1001") {
			          Shared.showMessage({
			            type: "chat-message",
			            icon: 'icon-contacts',
			            title: "Sua busca deve ser específica.",
			            route: "",
			            description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
			            timeout: 0,
			            elementID: "#scroller",
			          });
			        }

			        if (data.error.code == "1019") {
			          Shared.showMessage({
			            type: "error",
			            icon: 'icon-contacts',
			            title: "Nenhum Resultado Encontrado.",
			            route: "",
			            description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
			            timeout: 0,
			            elementID: "#scroller",
			          });
			        }
				}
				

				var pictureImageContactView = new PictureImageContactView({el: $('.picture_image')});
				pictureImageContactView.render(data);

				Shared.refreshDotDotDot();
				Shared.scrollerRefresh();
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

			// $('dl#contactsList dd ul li').removeAttr('class');
			console.log($(e.target).parent());
			$(e.target).parent().addClass('selected');

			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		},

		removeAccents: function(strAccents) {
			var strAccents = strAccents.split('');
			var strAccentsOut = new Array();
			var strAccentsLen = strAccents.length;
			var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
			var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
			for (var y = 0; y < strAccentsLen; y++) {
				if (accents.indexOf(strAccents[y]) != -1) {
					strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
				} else
					strAccentsOut[y] = strAccents[y];
			}
			strAccentsOut = strAccentsOut.join('');
			return strAccentsOut;
        },

	});

	return ContactsListView;
  
});