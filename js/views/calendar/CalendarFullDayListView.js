define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'collections/calendar/EventsListCollection',
	'views/home/LoadingView',
	'text!templates/calendar/calendarFullDayListTemplate.html',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
	'jqueryui',
	'jqueryui_datepicker_ptBR',
], function($, _, Backbone, Shared, EventsListCollection, LoadingView, calendarFullDayListTemplate, detailContentTemplate, primaryContentTemplate, jqueryui, jqueryui_datepicker_ptBR)
{
	var CalendarFullDayListView = Backbone.View.extend(
	{
		el: $('#content'),
		year: '',
		month: '',
		day: '',
		data: {},
		dayTitle: '',

		events:
		{
			'click #eventsTable a': 'selectItem'
		},

		render: function()
		{
			var self = this;
			var contentTitle;
			var container;

			if (!Shared.isSmartPhoneResolution())
			{
				this.$el = $('#contentDetail');
				this.$el.html(_.template(detailContentTemplate));

				contentTitle = $('#contentDetailTitle');
				container = $('#scrollerDetail');
			}
			else
			{	
				this.$el = $('#content');
				this.$el.html(_.template(primaryContentTemplate));

				contentTitle = $('#contentTitle');
				container = $('#scroller');
			}

			var loadingView = new LoadingView({el: container});
				loadingView.render();

			var dateStart = this.day + '/' + this.month + '/' + this.year;
			var dateEnd = this.day + '/' + this.month + '/' + this.year;

			var callbackSuccess = function (data)
			{
				var hourlyBusy = [];
				var events = new EventsListCollection();
				var date = new Date(self.year, self.month - 1, self.day);
				var allDayRowSpan = 48;

				for (var i in data.events)
				{
					var rowSpan = 0;

					var start = (data.events[i].get('eventStartDate')).split(' ');
					var dateStart = start[0].split('/');
					var timeStart = start[1].split(':')
					var dateTimeStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0], timeStart[0], timeStart[1]);
					var dateStartAux = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0], timeStart[0], timeStart[1]);
						dateStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0]);

					var end = (data.events[i].get('eventEndDate')).split(' ');
					var dateEnd = end[0].split('/');
					var timeEnd = end[1].split(':')
					var dateTimeEnd = new Date(dateEnd[2], (dateEnd[1] - 1), dateEnd[0], timeEnd[0], timeEnd[1]);
						dateEnd = new Date(dateEnd[2], (dateEnd[1] - 1), dateEnd[0]);

					if (dateStart.getTime() == date.getTime() || dateEnd.getTime() == date.getTime())
					{
						if (data.events[i].get('eventAllDay') == '1')
							rowSpan = allDayRowSpan;
						else
						{
							while (dateTimeStart.getTime() <= dateTimeEnd.getTime())
							{
								rowSpan = rowSpan + 1;
								dateTimeStart.setMinutes(dateTimeStart.getMinutes() + 30);
							}
						}

						events.add(data.events[i]);

						var dateStar = dateTimeStart;
						var eventSummary = new Object();
							eventSummary.dateStart = dateStartAux;
							eventSummary.dateEnd = dateTimeEnd;
							eventSummary.rowSpan = rowSpan;
							eventSummary.index = events.length - 1;

						hourlyBusy.push(eventSummary);
					}
				}

				var newData = {events: events.models, year: self.year, month: self.month, day: self.day, hourlyBusy: hourlyBusy, _: _};

				contentTitle.text($.datepicker.formatDate('DD, dd/mm/yy', new Date(self.year, self.month - 1, self.day)));
				
				self.setElement(container.empty().append(_.template(calendarFullDayListTemplate, newData)));
				self.loaded();
			}

			var callbackFail = function (error)
			{
				Shared.showMessage({
					type: "error",
					icon: 'icon-agenda',
					title: 'Não foi possível listar os eventos do dia. Por favor, tente novamente',
					description: '',
					timeout: 5000,
					elementID: Shared.isSmartPhoneResolution() ? '#message' : '#messageDetail',
				});
			}

			this.listEvents(dateStart, dateEnd, callbackSuccess, callbackFail);
		},

		loaded: function ()
		{
			$('#contentDetail .searchArea').remove();

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
			Shared.menuView.renderContextMenu('calendar',{});
		},

		initialize: function() { },

		selectItem: function(e)
		{
			e.preventDefault();

			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		},

		listEvents: function (pDateStart, pDateEnd, callbackSuccess, callbackFail)
		{
			var self = this;

			var eventsData = new EventsListCollection();
				eventsData.listEvents(pDateStart, pDateEnd)
				.done(function (data) 
				{
					if (callbackSuccess)
						callbackSuccess({ events: data.models, _: _ });
				})
				.fail(function (data) 
				{	
					console.log(data);

					if (callbackFail)
						callbackFail({ error: data.error, _: _ });
				});
		}
		
	});

	return CalendarFullDayListView;

});
