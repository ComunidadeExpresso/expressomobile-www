define ([
  'underscore',
  'backbone',
  'shared'
], function (_, Backbone, Shared) 
{
	var EventModel = Backbone.Model.extend(
	{
		defaults:
		{
	        eventID: "",
	        eventDate: "",
	        eventName: "",
	        eventDescription: "",
	        eventLocation: "",
	        eventParticipants: [],
	        eventStartDate: "",
	        eventEndDate: "",
	        eventAllDay: "0",
	        eventExParticipants: ""
		},

		initialize: function ()
		{
			this.api = Shared.api;
			this.readResource = '/Calendar/Events';
			this.updateResource = '';
			this.createResource = '';
			this.deleteResource = '';
		},

		route: function() 
		{
			return '/Calendar';
		},

		done: function (value)
		{
			this.done = value;

			return this;
		},

		fail: function (value)
		{
			this.fail = value;

			return this;
		},

		getEvent: function (pEventID)
		{	
			var that = this;

			console.log('pEventID: ' + pEventID);


			this.api
			.resource('Calendar/Event')
			.params({eventID: pEventID})
	        .done(function (result)
	        {
	        	var thisModel = new EventModel(result.events[0]);
	        		that.set(thisModel);

		        if (that.done)
	        		that.done(thisModel);
	        })
	        .fail( function (error) 
	        {
				if (that.fail)
	        		that.fail(error);
	        })
	        .execute();

			return that;

		},

		execute: function ()
		{
			return this.api.execute();
		}
	});

	return EventModel;

});