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
], function($, jqueryui, jqueryui_datepicker_ptBR, _, Backbone, Shared, LoadingView, CalendarListView, primaryContentTemplate)
{
	var CalendarView = Backbone.View.extend(
	{
		year: '',
		month: '',
		day: '',

		render: function()
		{
			this.clean();

			var elementID = "#content";
			var data = {_: _};

			var template = _.template(primaryContentTemplate, data);
			$(elementID).html(template);

			var loadingView = new LoadingView({el: $('#scroller')});
				loadingView.render();

			console.log(this.year + '-' + this.month + '-' + this.day);

			var calendarListview = new CalendarListView({el: $('#scroller')});
				calendarListview.year = this.year;
				calendarListview.month = this.month;
				calendarListview.day = this.day;
				calendarListview.render()

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
