define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'collections/calendar/EventsListCollection',
	'views/home/LoadingView',
	'text!templates/calendar/calendarEventsDayListTemplate.html',
], function($, _, Backbone, Shared, EventsListCollection, LoadingView, calendarEventsDayListTemplate)
{
	var CalendarEventsDayListView = Backbone.View.extend(
	{
		year: '',
		month: '',
		day: '',
		data: {},

		events:
		{
			'click #events li a': 'selectItem'
		},

		render: function()
		{
			var events = new EventsListCollection();
			var date = new Date(this.year, this.month - 1, this.day);

			for (var i in this.data.events)
			{
				var dateStart = ((this.data.events[i].get('eventStartDate')).split(' ')[0]).split('/');
					dateStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0]);

				if (dateStart.getTime() == date.getTime())
					events.add(this.data.events[i]);
			}

			var newData = {events: events.models, year: this.year, month: this.month, day: this.day, _:_};

			this.$el.html(_.template(calendarEventsDayListTemplate, newData));
			$('#eventsList').empty().append(this.$el);
		},

		initialize: function() { },

		selectItem: function (e)
		{
			e.preventDefault();
			Shared.router.navigate(e.currentTarget.getAttribute("href"),{trigger: true});
		}
		
	});

	return CalendarEventsDayListView;

});
