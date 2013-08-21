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

		execute: function ()
		{
			return this.api.execute();
		}
	});

	return EventModel;

});