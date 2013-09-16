define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'text!templates/calendar/calendarSaveEventTemplate.html',
	'text!templates/master/detailContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, calendarEditEventTemplate, detailContentTemplate)
{
	var d = Backbone.View.extend(
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

				console.log('!Shared.isSmartPhoneResolution()');
			}
			else
			{
				var loadingView = new LoadingView({el: $('#scroller')});
					loadingView.render();				

				console.log('Shared.isSmartPhoneResolution()');
			}

			contentTitle.text('Adicionar evento');

			this.$el.empty().html(_.template(calendarEditEventTemplate));
			this.loaded();
		},

		loaded: function() 
		{ 
			if (!Shared.isSmartPhoneResolution())
				Shared.scrollDetail = new iScroll('wrapperDetail');
			else
				Shared.scroll = new iScroll('wrapper');

			Shared.menuView.renderContextMenu('calendarAddEvent',{});

			var width = $('#contentDetail').width() - ($('body form#addEvent input[type=text]').position().left + 33);
			var width_date = width / 2 - 30; 

			console.log(width);

			$('body form#addEvent input[type=text]').width(width);
			$('body form#addEvent select').width(width);
			$('body form#addEvent textarea').width(width);
			$('body form#addEvent li.date input[type=text]').width(width_date);

		},

		initialize: function() { }
		
	});

	return d;

});
