define([
  'underscore',
  'backbone',
  'shared',
  'models/calendar/EventCategoryModel'
], function (_, Backbone, Shared, EventCategoryModel)
{
	var EventCategoriesCollection = Backbone.Collection.extend (
	{
		model: EventCategoryModel,
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
	        this.model = EventCategoryModel;
		},

		listEventCategories: function (pCategoryId)
		{	
			var that = this;
				that._data = {};

			var thatModel = EventCategoryModel;
			var data = this._data;

			this.api
	        .resource('Calendar/EventCategories')
	        .params({eventCategoryID:pCategoryId})
	        .done(function (result)
	        {
		        for (var i in result.eventCategories) 
	        	{
	        		var thisModel = new thatModel(result.eventCategories[i]);
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

	return EventCategoriesCollection;
});