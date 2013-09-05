define([
	'jquery',
	'jqueryui',
	'jqueryui_datepicker_ptBR',
	'underscore',
	'backbone',
	'shared',
	'views/home/LoadingView',
	'views/calendar/CalendarListView',
	'text!templates/master/primaryContentTemplate.html',
	'collections/home/ContextMenuCollection'
], function($, jqueryui, jqueryui_datepicker_ptBR, _, Backbone, Shared, LoadingView, CalendarListView, primaryContentTemplate, ContextMenuCollection)
{
	var CalendarView = Backbone.View.extend(
	{
		year: '',
		month: '',
		day: '',
		fullDay: false,

		render: function()
		{
			this.clean();

			var elementID = "#content";
			var data = {_: _};

			var template = _.template(primaryContentTemplate, data);
			$(elementID).html(template);

			var loadingView = new LoadingView({el: $('#scroller')});
				loadingView.render();

			var calendarListview = new CalendarListView({el: $('#scroller')});
				calendarListview.year = this.year;
				calendarListview.month = this.month;
				calendarListview.day = this.day;
				calendarListview.fullDay = this.fullDay;
				calendarListview.render();
			
			Shared.menuView.renderContextMenu('calendar',{});

			this.loaded();
		},

		initialize: function() { },

		loaded: function () 
		{
			$('.searchArea').remove();
			$('#contentTitle').text('Agenda');
		},

		clean: function ()
		{
			$('#content').empty();
			$('#contentDetail').empty();
		}
	});

	return CalendarView;

});
