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

		done: function (value)
		{
			this._data.done = value;
	        return this;
		},

		fail: function (value)
		{
			this._data.fail = value;
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

				if (that._data.done)
					that._data.done(that);
	        })
	        .fail( function (error) 
	        {
				if (that._data.fail) 
					that._data.fail(error); 
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