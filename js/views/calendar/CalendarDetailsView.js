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
		el: $('#content'),
		eventID: 0,

		render: function()
		{
			var self = this;
			var contentTitle = $('#contentTitle');
			var container = $('#scroller');

			if (!Shared.isSmartPhoneResolution())
			{
				// $('#contentDetail').html(_.template(detailContentTemplate));
				this.$el = $('#contentDetail');
				this.$el.html(_.template(detailContentTemplate));

				contentTitle = $('#contentDetailTitle');
				container = $('#scrollerDetail');
			}
			else
				this.$el.html(_.template(primaryContentTemplate));

			var loadingView = new LoadingView({el: container});
				loadingView.render();

			var callback = function (data)
			{
				contentTitle.text(data.event.get('eventName'));

				self.setElement(container.empty().append(_.template(calendarDetailsTemplate, data)));
				self.loaded();
			}

			this.getEvent(this.eventID, callback, callback);
		},

		getEvent: function (pEventID, callbackSucess, callbackFail)
		{
			var self = this;

			var eventModel = new EventModel();
				eventModel.getEvent(pEventID)
				.done(function (data) 
				{
					self.data = { event: data, _: _ };

					callbackSucess(self.data);
				})
				.fail(function (data) 
				{
					self.data = { error: data.error, _: _ };
					
					if (callbackFail)
						callbackFail(self.data);
				});
		},

		loaded: function()
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

		initialize: function() { }
		
	});

	return CalendarDetailsView;

});
