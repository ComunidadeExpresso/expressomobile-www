define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'text!templates/calendar/calendarDetailsTemplate.html',
	'text!templates/master/detailContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, calendarDetailsTemplate, detailContentTemplate)
{
	var CalendarDetailsView = Backbone.View.extend(
	{
		el: $('#scroller'),
		eventID: 0,

		render: function()
		{
			var that = this;
			var contentTitle = $('#contentTitle');

			if (!Shared.isSmartPhoneResolution())
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

			var callback = function (data)
			{
				console.log(data);

				contentTitle.text(data.event.get('eventName'));
				that.$el.empty().html(_.template(calendarDetailsTemplate, data));
				that.loaded();
			}

			this.getEvent(this.eventID, callback, callback);
		},

		getEvent: function (pEventID, callbackSucess, callbackFail)
		{
			var that = this;

			var eventModel = new EventModel();
				eventModel.getEvent(pEventID)
				.done(function (data) 
				{
					that.data = { event: data, _: _ };

					if (callbackSucess)
						callbackSucess(that.data);
				})
				.fail(function (data) 
				{
					that.data = { error: data.error, _: _ };
					
					if (callbackFail)
						callbackFail(that.data);
				});
		},

		loaded: function()
		{
			if (!Shared.isSmartPhoneResolution())
				Shared.scrollDetail = new iScroll('wrapperDetail');
			else
				Shared.scroll = new iScroll('wrapper');
		},

		initialize: function() { }
		
	});

	return CalendarDetailsView;

});
