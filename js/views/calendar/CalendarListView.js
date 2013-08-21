define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'collections/calendar/EventsListCollection',
	'views/home/LoadingView',
	'text!templates/calendar/calendarTemplate.html',
	'jqueryui',
	'jqueryui_datepicker_ptBR',
], function($, _, Backbone, Shared, EventsListCollection, LoadingView, calendarTemplate, jqueryui, jqueryui_datepicker_ptBR)
{
	var CalendarListView = Backbone.View.extend(
	{
		el: $('#scroller'),
		year: '',
		month: '',
		day: '',
		data: {},

		render: function()
		{
			console.log(this.year + '-' + this.month + '-' + this.day);

			var that = this;

			var callback = function ()
			{
				var template = _.template(calendarTemplate);
				that.$el.empty().html(template);
				that.renderDatePicker();
			}

			var pad = "00";
			var currentDate = new Date();
			var month = currentDate.getMonth() + 1; // Months are zero based;
			var m = pad.substring(0, pad.length - ("" + month).length) + ("" + month);
			var y = currentDate.getFullYear();
			var lastDay = new Date(y, m, 0);
				lastDay = lastDay.getDate();

			var pDateStart =  '01/' + m + '/' + y;
			var pDateEnd =  lastDay + '/' + m + '/' + y;

			this.getEvents(pDateStart, pDateEnd, callback, callback);
		},

		getEvents: function (pDateStart, pDateEnd, callbackSucess, callbackFail)
		{
			var that = this;

			var eventsData = new EventsListCollection();
				eventsData.getEvents(pDateStart, pDateEnd)
				.done(function (data) 
				{
					that.data = { events: data.models, _: _ };

					if (callbackSucess)
						callbackSucess();
				})
				.fail(function (data) 
				{
					that.data = { error: data.error, _: _ };
					
					if (callbackFail)
						callbackFail();
				});
		},

		initialize: function() { },

		changeMonthYear: function (y, m, widget)
		{
			var that = this;

			var callback = function (data)
			{
				that.refreshDatePicker()
			}

			var pad = "00";
			var m = pad.substring(0, pad.length - ("" + m).length) + ("" + m);
			var lastDay = new Date(y, m, 0);
				lastDay = lastDay.getDate();

			var pDateStart =  '01/' + m + '/' + y;
			var pDateEnd =  lastDay + '/' + m + '/' + y;

			this.getEvents(pDateStart, pDateEnd, callback, callback);
	 	},

		highlightDays: function (date)
		{
			if (!_.isEmpty(this.data.events))
			{
				for (var i in this.data.events)
				{
					var dateStart = ((this.data.events[i].get('eventStartDate')).split(' ')[0]).split('/');
						dateStart = new Date(dateStart[2], (dateStart[1] - 1), dateStart[0]);

					var dateEnd = ((this.data.events[i].get('eventEndDate')).split(" ")[0]).split('/');
						dateEnd = new Date(dateEnd[2], (dateEnd[1] - 1), dateEnd[0]);

					if (date.getTime() == dateStart.getTime() || date.getTime() == dateEnd.getTime())
					{
						return [true, 'hasEvent'];
					}
				}
			}

			return [true, ''];
		},

		refreshDatePicker: function ()
		{
			$('#agenda').datepicker("refresh");
		},

		renderDatePicker: function () 
		{
			var that = this;

			$('#agenda').datepicker(
			{
				dayNamesShort: $.datepicker.regional[ "pt-BR" ].dayNamesShort,
				dayNames: $.datepicker.regional[ "pt-BR" ].dayNames,
				monthNamesShort: $.datepicker.regional[ "pt-BR" ].monthNamesShort,
				monthNames: $.datepicker.regional[ "pt-BR" ].monthNames,
				inline: true,
				autoSize: true,
				nextText: '>',
				prevText: '<',
				dateFormat: 'DD, dd/mm/yy',
				onChangeMonthYear: function (year, month, widget)
				{
					that.data = {};
					that.changeMonthYear(year, month, widget);
				},
				beforeShowDay: function (date)
				{
					return that.highlightDays(date);
				},
				onSelect: function(date, obj)
				{
					var selectedDate = (date.split(', ')[1]).split('/');
					var url = 'Calendar/' + selectedDate[2] + '/' + selectedDate[1] + '/' + selectedDate[0];

					Shared.router.navigate(url, {trigger: true});

					// global_date = date;

					// if ($('body').hasClass('smartphone'))
					// {
					// 	$('#eventsList').html(new EJS({url: './templates/agenda-eventos.ejs'}).render());
					// 	$('#events').on('click', 'a', function (event)
					// 	{
					// 		var template = $(this).prop('href');

					// 		$('#scroller').html(new EJS({url: template}).render());

					// 		if (!$(this).hasClass('see_all'))
					// 			$('#contentTitle').text($(this).find('span').text());
					// 		else
					// 		{
					// 			$('#contentTitle').text(global_date);
					// 			$('#eventsTable').on('click', 'a', function (event)
					// 			{
					// 				var template = $(this).prop('href');
										
					// 				$('#scroller').html(new EJS({url: template}).render());
					// 				$('#contentTitle').text($(this).text());

					// 				scrollerRefresh();

					// 				return false;
					// 			});
					// 		}
							
					// 		scrollerRefresh();

					// 		return false;
					// 	});
					// }
					// else
					// {
					// 	$('#scrollerDetail').html(new EJS({url: './templates/agenda-eventos-completa.ejs'}).render());
					// 	$('#contentDetailTitle').text(date);
					// 	$('#eventsTable').on('click', 'a', function (event)
					// 	{
					// 		var template = $(this).prop('href');
					// 		var title,
					// 			panel;

					// 		if ($('body').hasClass('smartphone'))
					// 		{
					// 			panel = $('#scroller');
					// 			title = $('#contentTitle');
					// 		}
					// 		else
					// 		{
					// 			panel = $('#scrollerDetail');
					// 			title = $('#contentDetailTitle');
					// 		}

					// 		panel.html(new EJS({url: template}).render());
					// 		title.text($(this).text());
					// 		scrollerRefresh();

					// 		return false;
					// 	});
					// }

					// scrollerRefresh();
				}
			});

			if (this.year != '' && this.month != '' && this.day != '')
				$("#agenda").datepicker("setDate", new Date(this.year, this.month - 1, this.day));

			Shared.scroll = new iScroll('wrapper');
		}
	});

	return CalendarListView;

});
