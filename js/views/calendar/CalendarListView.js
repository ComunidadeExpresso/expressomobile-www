define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'collections/calendar/EventsListCollection',
	'views/home/LoadingView',
	'views/calendar/CalendarEventsDayListView',
	'views/calendar/CalendarFullDayListView',
	'text!templates/calendar/calendarTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
	'jqueryui',
	'jqueryui_datepicker_ptBR',
], function($, _, Backbone, Shared, EventsListCollection, LoadingView, CalendarEventsDayListView, CalendarFullDayListView, calendarTemplate, primaryContentTemplate, jqueryui, jqueryui_datepicker_ptBR)
{
	var CalendarListView = Backbone.View.extend(
	{
		el: $('#content'),
		year: '',
		month: '',
		day: '',
		fullDay: false,
		status: '',
		data: {},
		dayTitle: '',
		container: $('#scroller'),

		render: function()
		{
			var self = this;
			var pad = "00";
			var today = new Date();

			if (this.year == '' || this.year == undefined)
				this.year = today.getFullYear();

			if (this.month == '' || this.month == undefined)
			{
				this.month = today.getMonth() + 1; // Months are zero based;
				this.month = pad.substring(0, pad.length - ("" + this.month).length) + ("" + this.month);
			}

			if (this.day == '' || this.day == undefined)
			{
				this.day = today.getDate();
				this.day = pad.substring(0, pad.length - ("" + this.day).length) + ("" + this.day);
			}

			this.clean();

			var callback = function (data)
			{
				self.$el.html(_.template(primaryContentTemplate));
				self.setElement($('#scroller').html(_.template(calendarTemplate)));
				self.renderDatePicker();
				self.listDayEvents(data);
				self.loaded();
			}

			var lastDay = new Date(this.year, this.month, 0);
				lastDay = lastDay.getDate();

			var pDateStart =  '01/' + this.month + '/' + this.year;
			var pDateEnd =  lastDay + '/' + this.month + '/' + this.year;

			this.listEvents(pDateStart, pDateEnd, callback, callback);
		},

		listEvents: function (pDateStart, pDateEnd, callbackSucess, callbackFail)
		{
			var self = this;

			var eventsData = new EventsListCollection();
				eventsData.listEvents(pDateStart, pDateEnd)
				.done(function (data) 
				{
					self.data = { events: data.models, _: _ };

					if (callbackSucess)
						callbackSucess(self.data);
				})
				.fail(function (data) 
				{
					self.data = { error: data.error, _: _ };
					
					if (callbackFail)
						callbackFail(self.data);
				});
		},

		listDayEvents: function(data)
		{
			if (!Shared.isSmartPhoneResolution() || this.fullDay)
			{
				var calendarFullDayListView = new CalendarFullDayListView({el: $('#contentDetail')});
					calendarFullDayListView.year = this.year;
					calendarFullDayListView.month = this.month;
					calendarFullDayListView.day = this.day;
					calendarFullDayListView.data = data;
					calendarFullDayListView.dayTitle = this.dayTitle;
					calendarFullDayListView.render();
			}
			else
			{
				var calendarEventsDayListView = new CalendarEventsDayListView({el: $('#eventsList')});
					calendarEventsDayListView.year = this.year;
					calendarEventsDayListView.month = this.month;
					calendarEventsDayListView.day = this.day;
					calendarEventsDayListView.data = data;
					calendarEventsDayListView.render();
			}

			this.loaded();
		},

		initialize: function() 
		{
			this.container = $('#scroller');
		},

		changeMonthYear: function (y, m, widget)
		{
			var self = this;

			var callback = function (data)
			{
				self.refreshDatePicker();
				// self.listDayEvents();
			}

			var pad = "00";
			var m = pad.substring(0, pad.length - ("" + m).length) + ("" + m);
			var lastDay = new Date(y, m, 0);
				lastDay = lastDay.getDate();

			var pDateStart =  '01/' + m + '/' + y;
			var pDateEnd =  lastDay + '/' + m + '/' + y;

			this.listEvents(pDateStart, pDateEnd, callback, callback);
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
			// this.dayTitle = $.datepicker.formatDate('DD, dd/mm/yy', new Date());
		},

		renderDatePicker: function () 
		{
			var self = this;

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
					self.changeMonthYear(year, month, widget);
				},
				beforeShowDay: function (date)
				{
					return self.highlightDays(date);
				},
				onSelect: function(date, obj)
				{
					var selectedDate = (date.split(', ')[1]).split('/');
					var url = 'Calendar/' + selectedDate[2] + '/' + selectedDate[1] + '/' + selectedDate[0];

					Shared.router.navigate(url, {trigger: true});
				}
			});

			if (this.year != '' && this.month != '' && this.day != '')
				$("#agenda").datepicker("setDate", new Date(this.year, this.month - 1, this.day));

			this.dayTitle = $.datepicker.formatDate('DD, dd/mm/yy', new Date(this.year, this.month - 1, this.day));
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
			
			if (Shared.scroll != null) 
			{
				Shared.scroll.destroy();
				Shared.scroll = null;
			}

			Shared.scroll = new iScroll('wrapper');
			Shared.scrollerRefresh();
			Shared.menuView.renderContextMenu('calendar',{year: this.year, month: this.month, day: this.day});

			$('#content .searchArea').remove();
			$('#contentTitle').text('Agenda');

			if (this.status == 'OK')
			{
				Shared.showMessage({
					type: "success",
					icon: 'icon-agenda',
					title: 'Evento excluído com sucesso.',
					description: '',
					timeout: 3000,
					elementID: Shared.isSmartPhoneResolution() ? '#message' : '#messageDetail',
				});
			}
		},

		clean: function ()
		{
			var contentLoadingView = new LoadingView({el: $('#content')});
				contentLoadingView.render();

			if (!Shared.isSmartPhoneResolution())
			{
				var contentDetailLoadingView = new LoadingView({el: $('#contentDetail')});
					contentDetailLoadingView.render();
			}
		}
	});

	return CalendarListView;

});
