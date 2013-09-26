define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'views/calendar/CalendarEditEventAddParticipantsView',
	'collections/calendar/EventCategoriesCollection',
	'text!templates/calendar/calendarEditEventTemplate.html',
	'text!templates/master/detailContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, CalendarEditEventAddParticipantsView, EventCategoriesCollection, calendarEditEventTemplate, detailContentTemplate)
{
	var CalendarEditEventView = Backbone.View.extend(
	{
		el: $('#content'),
		eventID: 0,
		model: EventModel,
		year: '',
		month: '',
		day: '',

		types: 
		{
			"1": "Normal",
			"2": "Restrito"
			// "privateHiddenFields": "Privado",
			// "hourAppointment": "Apontamento de Horas"
		},

		priorities: 
		{
			"": "Nenhum",
			"1": "Baixo",
			"2": "Normal",
			"3": "Alto"
		},

		events: 
		{
			"click #addParticipants": "addParticipants",
			"click .css-checkbox": "removeParticipant"
		},

		render: function (options)
		{
			var self = this;
			var contentTitle = $('#contentTitle');
			var container = $('#scroller');

			if (options != undefined && options.model != undefined)
				this.model = options.model;
			else
			{
				this.model.set({eventTimeStart: '08:00'});
				this.model.set({eventTimeEnd: '08:30'});
			}

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

			contentTitle.text('Adicionar evento');

			var callback = function (data)
			{
				var newData = {eventCategories: data, event: self.model, types: self.types, priorities: self.priorities};

				self.setElement(container.html(_.template(calendarEditEventTemplate, newData)));
				self.loaded();
			}

			this.listEventCategories('', callback, callback);
		},

		loaded: function () 
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
			Shared.menuView.renderContextMenu('calendarAddEvent',{});

			$('#contentDetail .searchArea').remove();

			var width = $('#contentDetail').width() - ($('body form#addEvent input[type=text]').position().left + 33);
			var width_date = width / 2 - 30; 

			$('body form#addEvent input[type=text]').width(width);
			$('body form#addEvent select').width(width);
			$('body form#addEvent textarea').width(width);
			$('body form#addEvent li.date input[type=text]').width(width_date);
		},

		initialize: function (options) 
		{ 
			this.model = new EventModel();

			if (options != undefined)
			{
				this.year = options.year;
				this.month = options.month;
				this.day = options.day;
			}

			if (this.year != '' && this.month != '' && this.day != '')
			{
				this.model.set({eventDateStart: this.year + '-' + this.month + '-' + this.day});
				this.model.set({eventDateEnd: this.year + '-' + this.month + '-' + this.day});
			}

		},

		listEventCategories: function (pCategoryId, callbackSuccess, callbackFail)
		{
			var eventCategoriesData = new EventCategoriesCollection();
				eventCategoriesData.listEventCategories(pCategoryId)
				.done(function (data) 
				{
					callbackSuccess(data.models);
				})
				.fail(function (error) 
				{
					callbackFail(data.error);
				});
		},

		addParticipants: function (e)
		{
			e.preventDefault();

			var attrs = {
				eventDateStart: $('#eventDateStart').val(),
				eventTimeStart: $('#eventTimeStart').val(),
				eventDateEnd: $('#eventDateEnd').val(),
				eventTimeEnd: $('#eventTimeEnd').val(),
				eventID: $('eventID'),
				eventType: $('#eventType').val(),
				eventCategoryID: $('#eventCategoryID').val(),
		        eventName: $('#eventName').val(),
		        eventDescription: $('#eventDescription').val(),
		        eventLocation: $('#eventLocation').val(),
				eventPriority: $('#eventPriority').val(),
				eventOwnerIsParticipant: $('#eventOwnerIsParticipant').val(),
		        eventParticipants: $('#eventParticipants').val(),
		        eventExParticipants: $('#eventExParticipants').val(),
			};

			this.model = new EventModel(attrs);

			this.$el.off('click', '#addParticipants');
			this.$el.off('click', '.css-checkbox');

			var calendarEditEventAddParticipantsView = new CalendarEditEventAddParticipantsView({model: this.model, view: new CalendarEditEventView()});
				calendarEditEventAddParticipantsView.render();
		},

		removeParticipant: function (e)
		{
			var listParticipants = this.model.get('eventParticipants');
			var participant = $(e.target).val();
			var index = _.indexOf(listParticipants, participant);

			if (index != -1)
			{
				listParticipants.splice(index, 1);
				$(e.target).parent('li').fadeOut(400, function () { $(this).remove(); });
			}

			this.model.set({eventParticipants: listParticipants});
		}
	});

	return CalendarEditEventView;
});
