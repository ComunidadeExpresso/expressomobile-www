define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/contacts/contactsListTemplate.html',
  'collections/home/ContextMenuCollection',
], function($, _, Backbone, Shared, contactsListTemplate,ContextMenuCollection){

  var ContactsListView = Backbone.View.extend({

    secondViewName: '',

    render: function(){

      var that = this;

      var primaryElementID = "#content";
      var detailElementID = "#contentDetail";

      if (Shared.isSmartPhone()) {
        detailElementID = "#content";
      }

      $(detailElementID).html("");

      if (this.secondViewName != null) {
        console.log(this.secondViewName);
        if (this.secondViewName == "Personal") {
           //var secondView = new SettingsSupportListView({ el: $(detailElementID) });
           //secondView.render();
        }
        if (this.secondViewName == "General") {
           //var secondView = new SettingsAboutListView({ el: $(detailElementID) });
           //secondView.render();
        }
      } else { 
        var newData = {
          _: _ 
        };

        var compiledTemplate = _.template( contactsListTemplate, newData );
        $(primaryElementID).html( compiledTemplate ); 


        var contextMenu = new ContextMenuCollection();
        Shared.menuView.context.collection = contextMenu.getContactsMenu(that.folderID,that.msgID);
        Shared.menuView.context.render();

      }

      this.loaded();

    },

    initialize: function() {
      this.secondViewName = "";
    },

    loaded: function () 
    {

      var that = this;
      Shared.scroll = new iScroll('wrapper');

    }
  });

  return ContactsListView;
  
});
