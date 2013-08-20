define([
	'jquery',
	'underscore',
	'backbone',
	'shared',
	'views/home/LoadingView',
	'views/home/HomeView',
	'text!templates/contacts/detailsContactTemplate.html',
	'collections/contacts/DetailsContactCollection',
	'collections/home/ContextMenuCollection',
], function($, _, Backbone, Shared, LoadingView, HomeView , DetailsContactTemplate, DetailsContactCollection, ContextMenuCollection)
{
	var DetailsContactView = Backbone.View.extend(
	{
		el: $("#mainAppPageContent"),
		secondViewName: '',
		contactID: null,

		render: function(data)
		{
			var that = this;
			var primaryElementID = "#content";
			var detailElementID = "#contentDetail";
			var data = { _: _ };

			$(detailElementID).html("");

			if (Shared.isSmartPhone())
				detailElementID = "#content";

			var loadingView = new LoadingView({el: $(detailElementID)});
				loadingView.render();

			var done = function (data)
			{
				var contact = {contact: _.first(data.contacts), _: _};

				var compiledTemplate = _.template(DetailsContactTemplate, contact);
				$(detailElementID).html(compiledTemplate);
			}

			if (this.secondViewName == 'Personal')
				this.getPersonalContactDetails(this.contactID, done, done)
			else
				this.getGeneralContactDetails(this.contactID, done, done)

			// this.getContactDetails(this.contactID, this.secondViewName == 'Personal' ? '1' : '2', done, done);

			var contextMenu = new ContextMenuCollection();
			Shared.menuView.context.collection = contextMenu.getContactsMenu(that.folderID,that.msgID);
			Shared.menuView.context.render();

			this.loaded();			
		},

		initialize: function() { },

		loaded: function () 
		{
			var that = this;
			Shared.scroll = new iScroll('wrapper');

			var homeView = new HomeView();
			homeView.refreshWindow();
		},

		getContactDetails: function (pContactID, pContactType, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getContactDetails(pContactID, pContactType)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		getPersonalContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getPersonalContactDetails(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		},

		getGeneralContactDetails: function (pContactID, callbackSuccess, callbackFail)
		{
			var detailsContactCollection = new DetailsContactCollection();
				detailsContactCollection.getGeneralContactDetails(pContactID)
				.done(function (data) 
				{
					callbackSuccess({ contacts: data.models, _: _ });
				})
				.fail(function (data) 
				{
					callbackFail({ error: data.error, _: _ });
				});
		}
	});

	return DetailsContactView;
  
});