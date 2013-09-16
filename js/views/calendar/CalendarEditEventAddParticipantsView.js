define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/calendar/CalendarEditEventView',
	'views/home/LoadingView',
	'views/home/HomeView',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/calendar/calendarEditEventAddParticipantsTemplate.html',
	'collections/contacts/ContactsListCollection',
], function($, _, Backbone, Shared, EventModel, CalendarEditEventView, LoadingView, HomeView, detailContentTemplate, calendarEditEventAddParticipantsTemplate, ContactsListCollection)
{
	var CalendarEditEventAddParticipantsView = Backbone.View.extend(
	{
		// el: $('#content'),
		eventID: 0,
		model: EventModel,
		container: $('#scroller'),
		listSelecteds: [],

		events: 
		{
			"keypress .searchField": "searchGeneralContacts",
			"click #backToEditEvent": "backToEditEvent",
			"click .css-checkbox": "checkParticipant"
		},

		render: function ()
		{
			this.listGeneralContacts('');
		},

		listGeneralContacts: function (pSearch)
		{
			var self = this;
			var content = $('#content');
			var contentTitle = $('#contentTitle');
			var container = $('#scroller');

			if (!Shared.isSmartPhoneResolution())
			{
				content = $('#contentDetail');
				content.html(_.template(detailContentTemplate));

				container = $('#scrollerDetail');
				contentTitle = $('#contentDetailTitle');
			}
			else
				content.html(_.template(primaryContentTemplate));

			var loadingView = new LoadingView({el: container});	
				loadingView.render();

			contentTitle.text('Adicionar participantes');

			var callback = function (data)
			{
				self.$el.html(_.template(calendarEditEventAddParticipantsTemplate, data));
				container.empty().append(self.$el);
				self.setElement(content);

				// var pictureImageContactView = new PictureImageContactView({el: $('.picture_image')});
				// pictureImageContactView.render(data);

				self.loaded();
			};

			this.listContacts(pSearch, '2', callback, callback);
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

		searchGeneralContacts: function (e)
		{
			if (e.keyCode == 13)
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
					// var loadingView = new LoadingView({el: $('#scroller')});
					// loadingView.render();

					this.listGeneralContacts(pSearch);
				}

				this.searchLength = search.length
			}
		},

		loaded: function () 
		{ 
			var top = $('.top').outerHeight(true);
			var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);

			if (!Shared.isSmartPhoneResolution())
			{
				$('#wrapperDetail').css('top', top + search);

				if (Shared.scrollDetail != null) 
				{
					Shared.scrollDetail.destroy();
					Shared.scrollDetail = null;
				}
				Shared.scrollDetail = new iScroll('wrapperDetail');
			}
			else
			{
				$('#wrapper').css('top', top + search);

				if (Shared.scroll != null) 
				{
					Shared.scroll.destroy();
					Shared.scroll = null;
				}
				Shared.scroll = new iScroll('wrapper');
			}

			Shared.scrollerRefresh();
			Shared.refreshDotDotDot();
		},

		initialize: function (options) 
		{
			this.model = options.model;
			this.view = options.view;
		},

		backToEditEvent: function (e)
		{
			// e.preventDefault();
			this.view.render({model: this.model});
		},

		checkParticipant: function (e)
		{
			console.log('checkParticipant');
		}
	});

	return CalendarEditEventAddParticipantsView;

});
