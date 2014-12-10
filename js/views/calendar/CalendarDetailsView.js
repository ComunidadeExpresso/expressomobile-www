define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'views/calendar/CalendarListView',
	'text!templates/calendar/calendarDetailsTemplate.html',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, CalendarListView, calendarDetailsTemplate, detailContentTemplate, primaryContentTemplate)
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
				messageContainer = '#pageMessage';
			}
			else
			{
				this.$el.html(_.template(primaryContentTemplate));
				$('#content').empty().append(this.$el);

				contentTitle = $('#contentTitle');
				container = $('#scroller');
				messageContainer = '#pageMessage';
			}

			var loadingView = new LoadingView({el: container});
				loadingView.render();

			var callback = function (data)
			{
				// Valida se o proprietário do evento é o usuário logado para dar permissão de edição e exclusão.
				var isOwner = data.event.get('eventOwner').get('contactUIDNumber') == Shared.profile.contactUIDNumber;
				var date = data.event.get('eventDateStart').split('/');
				var pad = "00";

				self.year = date[2];
				self.month = pad.substring(0, pad.length - ("" + date[1]).length) + ("" + date[1]);
				self.day = pad.substring(0, pad.length - ("" + date[0]).length) + ("" + date[0]);

				data.event.set({ eventPriority: self.getPriority(data.event.get('eventPriority'))});

				self.loaded(data.event.get('eventID'), isOwner);

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

					// Atualiza o calendário de eventos para tablets e desktop
					if (!Shared.isSmartPhoneResolution())
					{
						var calendarListView = new CalendarListView();
						calendarListView.year = self.year;
						calendarListView.month = self.month;
						calendarListView.day = self.day;
						calendarListView.onlyDatePicker = true;
						calendarListView.render();
					}
				}

				contentTitle.text(data.event.get('eventName'));
				container.empty().append(_.template(calendarDetailsTemplate, data))
			}

			this.getEvent(this.eventID, callback, callback);
		},

		getEvent: function (pEventID, callbackSucess, callbackFail)
		{
			var self = this;

			var eventModel = new EventModel();
				eventModel.done(function (data) 
				{
					self.data = { event: data, _: _ };

					callbackSucess(self.data);
				})
				.fail(function (data) 
				{
					self.data = { error: data.error, _: _ };
					
					if (callbackFail)
						callbackFail(self.data);
				}).getEvent(pEventID);
		},

		loaded: function(eventID, isOwner)
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
			Shared.menuView.renderContextMenu('calendarDetailsEvent',{ isOwner: isOwner, eventID: eventID, year: this.year, month: this.month, day: this.day });
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
		},

		getPriority: function (priority)
		{
			var listPriorities = ['', 'Baixo', 'Normal', 'Alto'];
			
			if (priority == '')
				return "Nenhum";
			else
				return listPriorities[priority];
		}
		
	});

	return CalendarDetailsView;

});
