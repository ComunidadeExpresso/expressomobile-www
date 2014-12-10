define([
  'underscore',
  'backbone',
  'shared',
  'models/calendar/EventModel'
], function (_, Backbone, Shared, EventModel)
{
	var EventsListCollection = Backbone.Collection.extend (
	{
		model: EventModel,
		_data: {},
		_functions: {},

		done: function (value)
		{
			this._functions.done = value;
	        return this;
		},

		fail: function (value)
		{
			this._functions.fail = value;
	        return this;
		},

		initialize: function (models, options)
		{
			this.api = Shared.api;
	        this.model = EventModel;
		},

		listEvents: function (pDateStart, pDateEnd)
		{	
			var that = this;
				that._data = {};

			var thatModel = EventModel;
			var data = this._data;

			this.api
	        .resource('Calendar/Events')
	        .params({dateStart:pDateStart,dateEnd:pDateEnd})
	        .done(function (result)
	        {
		        for (var i in result.events) 
	        	{
	        		var thisModel = new thatModel(result.events[i]);
        			that.add(thisModel);
	        	}

				if (that._functions.done)
					that._functions.done(that);
	        })
	        .fail( function (error) 
	        {
				if (that._functions.fail) 
					that._functions.fail(error); 
	        })
	        .execute();

	        return that;
		},

		execute: function ()
		{
			return this.api.execute();
		}

	});

	return EventsListCollection;
});