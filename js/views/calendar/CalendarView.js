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
		el: $('#content'),
		year: '',
		month: '',
		day: '',
		fullDay: false,

		render: function()
		{
			this.clean();
			// var container = $('#content');
			// var data = {_: _};

			this.$el.empty().append(_.template(primaryContentTemplate));
			// this.$el.html(_.template(primaryContentTemplate, data));
			// container.empty().append(this.$el);

			var loadingView = new LoadingView({el: $('#scroller')});
				loadingView.render();

			var calendarListview = new CalendarListView({el: $('#scroller')});
				calendarListview.year = this.year;
				calendarListview.month = this.month;
				calendarListview.day = this.day;
				calendarListview.fullDay = this.fullDay;
				
			this.setElement(calendarListview.render());
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
