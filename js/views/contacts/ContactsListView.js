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

			if (Shared.isSmartPhone())
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

			// var contextMenu = new ContextMenuCollection();
			// Shared.menuView.context.collection = contextMenu.getContactsMenu();
			// Shared.menuView.context.render();

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
					this.listGeneralContacts(pSearch);
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
				var template = _.template(PersonalContactsListTemplate, data);
				$('#scroller').html(template);

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
				console.log(data);

				var template = _.template(GeneralContactsListTemplate, data);
				$('#scroller').html(template);

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
			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		}

	});

	return ContactsListView;
  
});