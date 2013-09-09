define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'text!templates/calendar/calendarEditEventTemplate.html',
	'text!templates/master/detailContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, calendarEditEventTemplate, detailContentTemplate)
{
	var CalendarEditEventView = Backbone.View.extend(
	{
		el: $('#scroller'),
		eventID: 0,

		render: function()
		{
			var that = this;
			var contentTitle = $('#contentTitle');

			if (!Shared.isSmartPhone())
			{
				$('#contentDetail').html(_.template(detailContentTemplate));

				var loadingView = new LoadingView({el: $('#scrollerDetail')});	
					loadingView.render();

				contentTitle = $('#contentDetailTitle');

				this.$el = $('#scrollerDetail');
			}
			else
			{
				var loadingView = new LoadingView({el: $('#scroller')});
					loadingView.render();				
			}

			contentTitle.text('Adicionar evento');
			this.$el.empty().html(_.template(calendarEditEventTemplate, data));
		},

		loaded: function() { },

		initialize: function() { }
		
	});

	return CalendarEditEventView;

});
