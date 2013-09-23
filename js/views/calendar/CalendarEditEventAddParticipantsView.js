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
		el: $('#content'),
		model: EventModel,
		events: 
		{
			"keypress .searchField": "searchGeneralContacts",
			"click #backToEditEvent": "backToEditEvent",
			"click .css-checkbox": "addParticipant"
		},

		render: function ()
		{
			this.listGeneralContacts('');
		},

		listGeneralContacts: function (pSearch)
		{
			var self = this;
			var contentTitle = $('#contentTitle');
			var container = $('#scroller');

			if (!Shared.isSmartPhoneResolution())
			{
				this.$el = $('#contentDetail');
				this.$el.html(_.template(detailContentTemplate));

				container = $('#scrollerDetail');
				contentTitle = $('#contentDetailTitle');
			}
			else
				this.$el.html(_.template(primaryContentTemplate));

			var loadingView = new LoadingView({el: container});	
				loadingView.render();

			contentTitle.text('Adicionar participantes');

			var callback = function (data)
			{
				container.empty().append(_.template(calendarEditEventAddParticipantsTemplate, data));
				self.setElement(self.$el);
				self.loaded();
			};

			this.listContacts(pSearch, '2', callback, callback);
		},

		listContacts: function (pSearch, ptype, callbackSuccess, callbackFail)
		{
			var self = this;

			var contactsData = new ContactsListCollection();
				contactsData.getContacts(pSearch, ptype)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, search: pSearch, listParticipants: self.model.get('eventParticipants'), _: _ });
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
				if (pSearch.length >= 3 || this.searchLength >= 3)
				{
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
			Shared.menuView.renderContextMenu('calendarAddEventParticipant',{});
		},

		initialize: function (options) 
		{
			this.model = options.model;
			this.view = options.view;
		},

		backToEditEvent: function (e)
		{
			e.preventDefault();

			this.$el.off('click', '#backToEditEvent');
			this.$el.off('click', '.css-checkbox');
			this.$el.off('keypress', '.searchField');

			this.view.render({model: this.model});
		},

		addParticipant: function (e)
		{	
			console.log('addParticipant');

			var listParticipants = this.model.get('eventParticipants');
			var participant = $(e.target).val();
			var index = _.isEmpty(listParticipants) ? -1 : _.indexOf(listParticipants, participant);

			if ($(e.target).is(':checked'))
			{
				if (index == -1)
					listParticipants.push(participant);
			}
			else
			{
				if (index != -1)
					listParticipants.splice(index, 1);
			}

			this.model.set({eventParticipants: listParticipants});
		}
	});

	return CalendarEditEventAddParticipantsView;

});
