define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'models/calendar/EventModel',
	'views/home/LoadingView',
	'text!templates/master/detailContentTemplate.html',
	'text!templates/master/primaryContentTemplate.html',
	'text!templates/calendar/calendarEditEventAddParticipantsTemplate.html',
	'collections/contacts/ContactsListCollection',
], function($, _, Backbone, Shared, EventModel, LoadingView, detailContentTemplate, primaryContentTemplate, calendarEditEventAddParticipantsTemplate, ContactsListCollection)
{
	var CalendarEditEventAddParticipantsView = Backbone.View.extend(
	{
		model: EventModel,
		listParticipants: [],
		senderName: 'calendar',

		events: 
		{
			"keypress .searchField": "searchGeneralContacts",
			"click .css-checkbox": "addParticipant",
		},

		render: function ()
		{
			this.listGeneralContacts('');
		},

		listGeneralContacts: function (pSearch)
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

			contentTitle.text('Adicionar participantes');

			var callback = function (data)
			{
				if (data.error == undefined)
					container.empty().append(_.template(calendarEditEventAddParticipantsTemplate, data));
				else 
				{
					if (data.error.code == "1001") 
					{
						Shared.showMessage({
							type: "chat-message",
							icon: 'icon-contacts',
							title: "Sua busca deve ser específica.",
							route: "",
							description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
							timeout: 0,
							animate: false,
							elementID: messageContainer,
						});
			        }

			        if (data.error.code == "1019") 
			        {
						Shared.showMessage({
							type: "error",
							icon: 'icon-contacts',
							title: "Nenhum Resultado Encontrado.",
							route: "",
							description: "Procure pelo nome e sobrenome.<br>Nenhum resultado será exibido caso a sua busca retorne mais do que 200 contatos.",
							timeout: 0,
							animate: false,
							elementID: messageContainer,
						});
			        }

			        container.empty();
				}

				self.setElement(self.$el);
				self.loaded();
			};

			this.listContacts(pSearch, '2', callback, callback);
		},

		listContacts: function (pSearch, ptype, callbackSuccess, callbackFail)
		{
			var self = this;

			var contactsData = new ContactsListCollection();
				contactsData.getContacts(pSearch, ptype)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, search: pSearch, listParticipants: self.model.get('eventParticipants'), _: _ });

				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		searchGeneralContacts: function (e)
		{
			if (e.keyCode == 13)
			{
				var search = $('.searchField').val();
				var pSearch = '';

				// Define o parâmetro da busca
				if (search.length >= 3)
					pSearch  = search;
				else
					pSearch = '';
				
				// Define se precisa fazer a busca ou não
				if (pSearch.length >= 3 || this.searchLength >= 3)
				{
					this.listGeneralContacts(pSearch);
				}

				this.searchLength = search.length
			}
		},

		loaded: function () 
		{ 
			var top = $('.topHeader').outerHeight(true);
			var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);

			if (!Shared.isSmartPhoneResolution())
			{
				$('#wrapperDetail').css('top', top + search);

				if (Shared.scrollDetail != null) 
				{
					Shared.scrollDetail.destroy();
					Shared.scrollDetail = null;
				}
				Shared.scrollDetail = new iScroll('wrapperDetail');
			}
			else
			{
				$('#wrapper').css('top', top + search);

				if (Shared.scroll != null) 
				{
					Shared.scroll.destroy();
					Shared.scroll = null;
				}
				Shared.scroll = new iScroll('wrapper');
			}

			Shared.scrollerRefresh();
			Shared.refreshDotDotDot();

			var params = {};
				params.saveCallBack = this.backToEditEvent;
	      		params.parentCallBack = this;

			Shared.menuView.renderContextMenu('calendarAddEventParticipant', params);
		},

		initialize: function (options) 
		{
			this.listParticipants = options.listParticipants;
			this.model = options.model;
			this.view = options.view;
		},

		backToEditEvent: function (obj)
		{
			if (obj.target)
			{
				obj.preventDefault();
				obj = this;
			}

			if (obj.senderName == 'compose') {
				obj.view.addContactToField({model: obj.model , listParticipants: obj.listParticipants });
			} else {
				obj.view.render({model: obj.model, listParticipants: obj.listParticipants});
			}

		},

		addParticipant: function (e)
		{	
			var listParticipantsID = this.model.get('eventParticipants');
			var listParticipants = this.listParticipants;
			var id = $(e.target).val();
			var name = $(e.target).attr('data-name');
			var mail = $(e.target).attr('data-mail');
			var index = _.isEmpty(listParticipantsID) ? -1 : _.indexOf(listParticipantsID, id);
			var indexNames = index;

			_.each(listParticipants, function (participant, i) 
			{
				if (participant.participantID == id && participant.participantName == name)
					indexNames = i; 
			});

			if ($(e.target).is(':checked'))
			{
				if (index == -1)
				{
					listParticipantsID.push(id);
					listParticipants.push({ participantID: id, participantName: name, participantMail: mail });
				}
			}
			else
			{
				if (index != -1)
				{
					listParticipantsID.splice(index, 1);
					listParticipants.splice(indexNames, 1);
				}	
			}

			this.model.set({eventParticipants: listParticipantsID});
			this.listParticipants = listParticipants;
		}
	});

	return CalendarEditEventAddParticipantsView;

});
