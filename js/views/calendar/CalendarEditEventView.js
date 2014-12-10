define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'views/calendar/CalendarEditEventAddParticipantsView',
	'collections/calendar/EventCategoriesCollection',
	'text!templates/calendar/calendarEditEventTemplate.html',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
], function($, _, Backbone, Shared, EventModel, LoadingView, CalendarEditEventAddParticipantsView, EventCategoriesCollection, calendarEditEventTemplate, detailContentTemplate, primaryContentTemplate)
{
	var CalendarEditEventView = Backbone.View.extend(
	{
		eventID: 0,
		model: EventModel,
		listParticipants: [],
		year: '',
		month: '',
		day: '',
		data: {},

		types: 
		{
			"1": "Normal",
			"2": "Restrito"
			// "privateHiddenFields": "Privado",
			// "hourAppointment": "Apontamento de Horas"
		},

		priorities: 
		{
			"": "Nenhum",
			"1": "Baixo",
			"2": "Normal",
			"3": "Alto"
		},

		events: 
		{
			"click #addParticipants": "addParticipants",
			"click .css-checkbox": "removeParticipant"
		},

		render: function (options)
		{
			var self = this;
			var contentTitle;
			var container;

			if (options != undefined)
			{
				if (options.model != undefined)
					this.model = options.model;

				if (options.listParticipants != undefined)
					this.listParticipants = options.listParticipants;
			}
			else
			{
				this.model.set({eventTimeStart: '08:00'});
				this.model.set({eventTimeEnd: '08:30'});
			}

			if (!Shared.isSmartPhoneResolution())
			{
				this.$el.html(_.template(detailContentTemplate));
				$('#contentDetail').empty().append(this.$el);

				container = $('#scrollerDetail');
				contentTitle = $('#contentDetailTitle');
			}
			else
			{
				this.$el.html(_.template(primaryContentTemplate));
				$('#content').empty().append(this.$el);

				container = $('#scroller');
				contentTitle = $('#contentTitle');
			}

			var loadingView = new LoadingView({el: container});	
				loadingView.render();

			contentTitle.text('Adicionar evento');

			var callback = function (data)
			{
				var listCategorias = data;

				if (self.eventID > 0)
				{
					contentTitle.text('Editar evento');

					var callbackGetEvent = function (data)
					{
						var pad = '00';
						var dateStart = (data.get('eventDateStart')).split('/');
						var dateEnd = (data.get('eventDateEnd')).split('/');

						data.set({ eventDateStart: dateStart[2] + '-' + pad.substring(0, pad.length - ("" + dateStart[1]).length) + ("" + dateStart[1]) + '-' + pad.substring(0, pad.length - ("" + dateStart[0]).length) + ("" + dateStart[0]) });
						data.set({ eventDateEnd: dateEnd[2] + '-' + pad.substring(0, pad.length - ("" + dateEnd[1]).length) + ("" + dateEnd[1]) + '-' + pad.substring(0, pad.length - ("" + dateEnd[0]).length) + ("" + dateEnd[0]) });

						if (data.get('eventParticipants') != undefined && data.get('eventParticipants').length > 0)
						{
							var listParticipantsID = [];
							_.each(data.get('eventParticipants'), function (participant) 
							{
								listParticipantsID.push(participant.contactUIDNumber);
							});
							data.set({ eventParticipants: listParticipantsID });

							var listParticipants = [];
							_.each(data.get('eventParticipantsLdap'), function (participantLdap) 
							{
								listParticipants.push({ participantID: participantLdap.get('contactUIDNumber'), participantName: participantLdap.get('contactFullName') });
							});
							self.listParticipants = listParticipants
						}

						self.model = data;

						var newData = {eventCategories: listCategorias, event: self.model, listParticipants: self.listParticipants, types: self.types, priorities: self.priorities};

						container.html(_.template(calendarEditEventTemplate, newData));
						self.setElement(self.$el);
						self.loaded();
					}

					self.getEvent(self.eventID, callbackGetEvent, callbackGetEvent);
				}	
				else
				{
					var newData = {eventCategories: listCategorias, event: self.model, listParticipants: self.listParticipants, types: self.types, priorities: self.priorities};

					container.html(_.template(calendarEditEventTemplate, newData))
					self.setElement(self.$el);
					self.loaded();
				}

			}

			this.listEventCategories('', callback, callback);
		},

		getEvent: function (pEventID, callbackSucess, callbackFail)
		{
			var self = this;
			var eventModel = new EventModel();
				eventModel.getEvent(pEventID)
				.done(function (data) 
				{
					if (callbackSucess)
						callbackSucess(data);
				})
				.fail(function (error) 
				{
					if (callbackFail)
						callbackFail(self.data);
				});
		},

		loaded: function () 
		{ 
			var width = 0;

			if (!Shared.isSmartPhoneResolution())
			{
				width = $('#contentDetail').width() - ($('body form#addEvent input[type=text]').position().left + 33);
				
				if (Shared.scrollDetail != null) 
				{
					Shared.scrollDetail.destroy();
					Shared.scrollDetail = null;
				}

				Shared.scrollDetail = new iScroll('wrapperDetail');
			}
			else
			{
				width = $('#content').width() - ($('body form#addEvent input[type=text]').position().left + 33);

				if (Shared.scroll != null) 
				{
					Shared.scroll.destroy();
					Shared.scroll = null;
				}

				Shared.scroll = new iScroll('wrapper');
			}

			Shared.scrollerRefresh();

			var params = {};
				params.saveCallBack = this.saveEvent;
				params.addParticipantsCallBack = this.addParticipants;
	      		params.parentCallBack = this;

			Shared.menuView.renderContextMenu('calendarAddEvent', params);

			$('#contentDetail .searchArea').remove();
			$('#content .searchArea').remove();

			var width_date = width / 2 - 30; 

			$('body form#addEvent input[type=text]').width(width);
			$('body form#addEvent select').width(width);
			$('body form#addEvent textarea').width(width);
			$('body form#addEvent li.date input[type=text]').width(width_date);
		},

		initialize: function (options) 
		{ 
			this.model = new EventModel();

			if (options != undefined)
			{
				this.year = options.year;
				this.month = options.month;
				this.day = options.day;
			}

			if (this.year != '' && this.month != '' && this.day != '')
			{
				this.model.set({eventDateStart: this.year + '-' + this.month + '-' + this.day});
				this.model.set({eventDateEnd: this.year + '-' + this.month + '-' + this.day});
			}
		},

		listEventCategories: function (pCategoryId, callbackSuccess, callbackFail)
		{
			var eventCategoriesData = new EventCategoriesCollection();
				eventCategoriesData.done(function (data) 
				{
					callbackSuccess(data.models);
				})
				.fail(function (error) 
				{
					callbackFail(data.error);
				}).listEventCategories(pCategoryId);
		},

		addParticipants: function (obj)
		{
			if (obj.target)
			{
				obj.preventDefault();
				obj = this;
			}

			var categoriesSelected = $('.css-checkbox.eventCategories').map(function () { if ($(this).is(':checked')) return $(this).val(); }).toArray().join(',');
			var attrs = {
				eventDateStart: $('#eventDateStart').val(),
				eventTimeStart: $('#eventTimeStart').val(),
				eventDateEnd: $('#eventDateEnd').val(),
				eventTimeEnd: $('#eventTimeEnd').val(),
				eventID: $('#eventID').val(),
				eventType: $('#eventType').val(),
				eventCategoryID: categoriesSelected,
				eventName: $('#eventName').val(),
				eventDescription: $('#eventDescription').val(),
				eventLocation: $('#eventLocation').val(),
				eventPriority: $('#eventPriority').val(),
				eventOwnerIsParticipant: $('#eventOwnerIsParticipant').val(),
				eventExParticipants: $('#eventExParticipants').val(),
			};

			obj.model.set(attrs);

			var calendarEditEventAddParticipantsView = new CalendarEditEventAddParticipantsView({ listParticipants: obj.listParticipants, model: obj.model, view: new CalendarEditEventView()});
				calendarEditEventAddParticipantsView.render();
		},

		saveEvent: function (obj)
		{
			if (obj.target)
			{
				obj.preventDefault();
				obj = this;
			}

			var dateStart = ($('#eventDateStart').val()).split('-');
			var dateEnd = ($('#eventDateEnd').val()).split('-');
			var participants = $('.css-checkbox.eventParticipants').map(function() { return $(this).val(); }).toArray();
			var categoriesSelected = $('.css-checkbox.eventCategories').map(function () { if ($(this).is(':checked')) return $(this).val(); }).toArray().join(',');
			var attrs = {
				eventDateStart: dateStart[2] + '/' + dateStart[1] + '/' + dateStart[0],
				eventTimeStart: $('#eventTimeStart').val(),
				eventDateEnd: dateEnd[2] + '/' + dateEnd[1] + '/' + dateEnd[0],
				eventTimeEnd: $('#eventTimeEnd').val(),
				eventID: $('#eventID').val(),
				eventType: $('#eventType').val(),
				eventCategoryID: categoriesSelected,
				eventName: $('#eventName').val(),
				eventDescription: $('#eventDescription').val(),
				eventLocation: $('#eventLocation').val(),
				eventPriority: $('#eventPriority').val(),
				eventOwnerIsParticipant: '1',
				eventParticipants: participants.join(),
				eventExternalParticipants: $('#eventExParticipants').val(),
			};

			var callbackSucess = function (data)
			{
				obj.listParticipants = [];

				if (data.event != undefined)
					Shared.router.navigate('/Calendar/Events/' + data.event.get('eventID') + '/OK', {trigger: true});
			}

			var callbackFail = function (data)
			{
				var message = '*Campos obrigatórios';
				var description = '';

				if (data.error != undefined)
				{
					message = 'Ocorreu um erro ao salvar o evento.';

					if (data.error.code == "1051")
						description = 'Verifique se já existe um evento para a datas selecionadas ou se os campos foram preenchidos corretamente.';
					else if (data.error.code == "1043")
						description = 'Verifique se o título do evento foi preenchido corretamente.';	
				}

				Shared.showMessage({
					type: "error",
					icon: 'icon-agenda',
					title: message,
					description: description,
					timeout: 3000,
					elementID: '#pageMessage',
				});
			}

			obj.save(attrs, callbackSucess, callbackFail);
		},

		save: function (params, callbackSucess, callbackFail)
		{
			var eventModel = new EventModel();
				eventModel.saveEvent(params)
				.done(function (data) 
				{
					var newData = { event: data, _: _ };

					if (callbackSucess)
						callbackSucess(newData);
				})
				.fail(function (error) 
				{
					if (callbackFail)
						callbackFail(error);
				});
		},

		removeParticipant: function (e)
		{
			var listParticipantsID = this.model.get('eventParticipants');
			var listParticipants = this.listParticipants;
			var id = $(e.target).val();
			var name = $(e.target).attr('data-name');
			var index = _.indexOf(listParticipantsID, id);
			var indexNames = index;

			_.each(listParticipants, function (participant, i) 
			{
				if (participant.participantID == id && participant.participantName == name)
					indexNames = i; 
			});

			if (index != -1)
			{
				listParticipantsID.splice(index, 1);
				listParticipants.splice(indexNames, 1);
				$(e.target).parent('li').fadeOut(400, function () { $(this).remove(); });
			}

			this.model.set({eventParticipants: listParticipantsID});
		}
	});

	return CalendarEditEventView;
});
