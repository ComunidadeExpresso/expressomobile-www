define([
  'underscore',
  'backbone',
  'shared',
  'models/home/ContextMenuModel'
], function(_, Backbone, Shared, ContextMenuModel){

  var ContextMenuCollection = Backbone.Collection.extend({
      
      model: ContextMenuModel,

      initialize : function(models, options) {
        this.api = Shared.api;
        this.model = ContextMenuModel;

      },

      createModelsFromArray: function(arrJson) {
        for (var i in arrJson) {
          var currentModel = new ContextMenuModel(arrJson[i]);
          this.add(currentModel);
        }
      },

      getDetailMessageMenu: function(msgID,folderID) {
        var menuItems = [
            { route: "/Mail/Message/New", title:"Nova Mensagem"},
            { route: "/Mail/Message/DelMessage/" + msgID + "/" + folderID, title: "Excluir"},
            { route: "/Mail/Message/ReplyMessage/" + msgID + "/" + folderID, title: "Responder"},
            { route: "/Mail/Message/ReplyToAll/" + msgID + "/" + folderID, title: "Responder p/ Todos"},
            { route: "/Mail/Message/Forward/" + msgID + "/" + folderID, title: "Encaminhar"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getContactsMenu: function() {
        var menuItems = [
            { route: "/Contacts/Personal", title:"Contatos Pessoais"},
            { route: "/Contacts/General", title: "Catálogo Geral"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      }

  });

  return ContextMenuCollection;

});