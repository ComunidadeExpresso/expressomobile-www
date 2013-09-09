define ([
	'underscore',
	'backbone',
	'shared',
	'models/contacts/ContactModel',
	'collections/contacts/DetailsContactCollection'
], function (_, Backbone, Shared, ContactModel, DetailsContactCollection) 
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
	        eventParticipantsLdap: [],
	        eventStartDate: "",
	        eventEndDate: "",
	        eventAllDay: "0",
	        eventExParticipants: "",
			eventCategoryID: "",
			eventDateEnd: "",
			eventDateStart: "",
			eventDescription: "",
			eventOwner: "",
			eventPriority: "",
			eventTimeEnd: "",
			eventTimeStart: ""
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

			this.api
			.resource('Calendar/Event')
			.params({eventID: pEventID})
	        .done(function (result)
	        {
	        	// var thisModel = new EventModel(result.events[0]);
	        		that.set(result.events[0]);
	        		that.getEventOwner();

		        // if (that.done)
	        	// 	that.done(that);
	        })
	        .fail( function (error) 
	        {
	        	console.log('getEvent');
				console.log(error);

				if (that.fail)
	        		that.fail(error);
	        })
	        .execute();

			return that;

		},

		getPriority: function ()
		{
			var priority = ['-', 'Baixa', 'Normal', 'Alta'];

			return priority[this.get('eventPriority')];
		},

		getEventParticipants: function (callback)
		{
			var listParticipants = this.get('eventParticipants');
			var listUidNumbers = [];
			var that = this;

			for (var i in listParticipants)
				listUidNumbers.push(listParticipants[i].contactUIDNumber);

			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getContactDetails(listUidNumbers)
				.done (function (data) 
				{
					that.set({eventParticipantsLdap: data.models});

					 if (that.done)
		        		that.done(that)
				})
				.fail (function (error) 
				{
					console.log('getEventParticipants');
					console.log(error);

					if (that.fail)
		        		that.fail(error);
				})
		},

		getEventOwner: function (callback)
		{
			var that = this;

			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getContactDetails(this.get('eventOwner'))
				.done (function (data) 
				{
					that.set({eventOwner: data.models[0]});
	        		that.getEventParticipants();
				})
				.fail (function (error) 
				{
					console.log('getEventOwner');
					console.log(error);

					if (that.fail)
		        		that.fail(error);
				})
		},

		execute: function ()
		{
			return this.api.execute();
		}
	});

	return EventModel;

});