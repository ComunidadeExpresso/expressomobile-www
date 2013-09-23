define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'views/calendar/CalendarEditEventView',
], function($, _, Backbone, Shared, EventModel, LoadingView, CalendarEditEventView)
{
	var CalendarSaveEventView = Backbone.View.extend(
	{
		el: $('#content'),
		eventID: 0,
		model: EventModel,
		params: {},

		render: function (options)
		{
			var self = this;

			if (!Shared.isSmartPhoneResolution())
				this.$el = $('#contentDetail');

			// var loadingView = new LoadingView({el: this.$el});	
			// 	loadingView.render();

			// var calendarEditEventView = new CalendarEditEventView();
			// Shared.menuView.renderContextMenu('calendarAddEvent',{});

			var callback = function (result)
			{
				console.log('callback');
				console.log(result);
				Shared.router.navigate('/Calendar/Events/Add/' + self.model.id, {trigger: true});
				// Backbone.history.navigate('/Calendar/Events/Add/' + self.model.id, true); 
				// self.view.render({model: self.model});
			}

			this.saveEvent(callback, callback);
		},

		saveEvent: function(callbackSucess, callbackFail)
		{
			console.log(this.model);

			var eventModel = new EventModel();

			// eventModel.save()
			this.model.saveEvent(this.params)
			.done(function (data) 
			{
				// self.data = { event: data, _: _ };

				if (callbackSucess)
					callbackSucess(data);
			})
			.fail(function (error) 
			{
				// self.data = { error: data.error, _: _ };
				
				if (callbackFail)
					callbackFail(error);
			});
		},

		initialize: function (options)  
		{
			var dateStart = ($('#eventDateStart').val()).split('-');
			var dateEnd = ($('#eventDateEnd').val()).split('-');

			this.params = {
				eventDateStart: dateStart[2] + '/' + dateStart[1] + '/' + dateStart[0],
				eventTimeStart: $('#eventTimeStart').val(),
				eventDateEnd: dateEnd[2] + '/' + dateEnd[1] + '/' + dateEnd[0],
				eventTimeEnd: $('#eventTimeEnd').val(),
				eventID: $('#eventID').val(),
				eventType: $('#eventType').val(),
				eventCategoryID: $('#eventCategoryID').val(),
		        eventName: $('#eventName').val(),
		        eventDescription: $('#eventDescription').val(),
		        eventLocation: $('#eventLocation').val(),
				eventPriority: $('#eventPriority').val(),
				eventOwnerIsParticipant: '1',
		        eventParticipants: $('#eventParticipants').val(),
		        eventExParticipants: $('#eventExParticipants').val(),
			};

			this.model = new EventModel(this.params);
			this.view = new CalendarEditEventView();
		}
		
	});

	return CalendarSaveEventView;

});
