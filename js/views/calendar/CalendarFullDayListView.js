define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'collections/calendar/EventsListCollection',
	'views/home/LoadingView',
	'text!templates/calendar/calendarFullDayListTemplate.html',
	'text!templates/master/detailContentTemplate.html',
], function($, _, Backbone, Shared, EventsListCollection, LoadingView, calendarFullDayListTemplate, detailContentTemplate)
{
	var CalendarFullDayListView = Backbone.View.extend(
	{
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
			var contentTitle = $('#contentTitle');
			var container = $('#scroller');

			if (!Shared.isSmartPhone())
			{
				$('#contentDetail').html(_.template(detailContentTemplate));

				var loadingView = new LoadingView({el: $('#scrollerDetail')});	
					loadingView.render();

				contentTitle = $('#contentDetailTitle');
				container = $('#scrollerDetail');
			}
			else
			{
				var loadingView = new LoadingView({el: $('#scroller')});
					loadingView.render();				
			}

			var hourlyBusy = [];
			var events = new EventsListCollection();
			var date = new Date(this.year, this.month - 1, this.day);

			for (var i in this.data.events)
			{
				var start = (this.data.events[i].get('eventStartDate')).split(' ');
				var dateStart = start[0].split('/');
				var timeStart = start[1].split(':')
				var dateTimeStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0], timeStart[0], timeStart[1]);
				var dateStartAux = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0], timeStart[0], timeStart[1]);
					dateStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0]);

				var end = (this.data.events[i].get('eventEndDate')).split(' ');
				var dateEnd = end[0].split('/');
				var timeEnd = end[1].split(':')
				var dateTimeEnd = new Date(dateEnd[2], (dateEnd[1] - 1), dateEnd[0], timeEnd[0], timeEnd[1]);
					dateEnd = new Date(dateEnd[2], (dateEnd[1] - 1), dateEnd[0]);

				if (dateStart.getTime() == date.getTime() || dateEnd.getTime() == date.getTime())
				{
					var rowSpan = 0;

					while (dateTimeStart.getTime() <= dateTimeEnd.getTime())
					{
						rowSpan = rowSpan + 1;
						dateTimeStart.setMinutes(dateTimeStart.getMinutes() + 30);
					}

					var dateStar = dateTimeStart;
					var eventSummary = new Object();
						eventSummary.dateStart = dateStartAux;
						eventSummary.dateEnd = dateTimeEnd;
						eventSummary.index = i;
						eventSummary.rowSpan = rowSpan;

					hourlyBusy.push(eventSummary);
					events.add(this.data.events[i]);
				}
			}

			var newData = {events: events.models, year: this.year, month: this.month, day: this.day, hourlyBusy: hourlyBusy, _: _};

			this.$el.html(_.template(calendarFullDayListTemplate, newData));

			contentTitle.text(this.dayTitle);
			container.empty().append(this.$el);

			Shared.scroll = new iScroll('wrapperDetail');
			Shared.scroll = new iScroll('wrapper');
		},

		initialize: function() { },

		selectItem: function(e)
		{
			e.preventDefault();

			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		}
		
	});

	return CalendarFullDayListView;

});
