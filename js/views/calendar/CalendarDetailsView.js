define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'text!templates/calendar/calendarDetailsTemplate.html',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, calendarDetailsTemplate, detailContentTemplate, primaryContentTemplate)
{
	var CalendarDetailsView = Backbone.View.extend(
	{
		eventID: 0,
		status: '',
		year: '',
		month: '',
		day: '',

		events: 
		{
			"click #contextMenu ul li a": "selectItem",
		},

		selectItem: function(e)
		{
			e.preventDefault();
			console.log($(e.target).attr('data-action'));
			console.log(this.eventID);
		},

		render: function()
		{
			var self = this;
			var contentTitle;
			var container;
			var messageContainer;

			if (!Shared.isSmartPhoneResolution())
			{
				this.$el.html(_.template(detailContentTemplate));
				$('#contentDetail').empty().append(this.$el);

				contentTitle = $('#contentDetailTitle');
				container = $('#scrollerDetail');
				messageContainer = '#messageDetail';
			}
			else
			{
				this.$el.html(_.template(primaryContentTemplate));
				$('#content').empty().append(this.$el);

				contentTitle = $('#contentTitle');
				container = $('#scroller');
				messageContainer = '#message';
			}

			var loadingView = new LoadingView({el: container});
				loadingView.render();

			var callback = function (data)
			{
				var date = data.event.get('eventDateStart').split('/');
				var pad = "00";

				this.year = date[2];
				this.month = pad.substring(0, pad.length - ("" + date[1]).length) + ("" + date[1]);
				this.day = pad.substring(0, pad.length - ("" + date[0]).length) + ("" + date[0]);

				contentTitle.text(data.event.get('eventName'));
				container.empty().append(_.template(calendarDetailsTemplate, data))

				self.loaded(data.event.get('eventID'));

				if (self.status == 'OK')
				{
					Shared.showMessage({
						type: "success",
						icon: 'icon-agenda',
						title: 'Evento salvo com sucesso.',
						description: '',
						timeout: 3000,
						elementID: messageContainer,
					});
				}
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

		loaded: function(eventID)
		{
			$('.searchArea').remove();

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
			Shared.menuView.renderContextMenu('calendarDetailsEvent',{ eventID: eventID, year: this.year, month: this.month, day: this.day });
		},

		initialize: function() 
		{
			var pad = "00";
			var today = new Date();

			if (this.year == '' || this.year == undefined)
				this.year = today.getFullYear();

			if (this.month == '' || this.month == undefined)
			{
				this.month = today.getMonth() + 1; // Months are zero based;
				this.month = pad.substring(0, pad.length - ("" + this.month).length) + ("" + this.month);
			}

			if (this.day == '' || this.day == undefined)
				this.day = today.getDate();
		}
		
	});

	return CalendarDetailsView;

});
