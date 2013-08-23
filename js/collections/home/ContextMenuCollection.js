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

      getDetailMessageMenu: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/New", title:"Nova Mensagem", iconClass : 'btn-compose', primary: true},
            { route: "/Mail/Message/DelMessage/" + msgID + "/" + folderID, title: "Excluir"},
            { route: "/Mail/Message/ReplyMessage/" + msgID + "/" + folderID, title: "Responder"},
            { route: "/Mail/Message/ReplyToAll/" + msgID + "/" + folderID, title: "Responder p/ Todos"},
            { route: "/Mail/Message/Forward/" + msgID + "/" + folderID, title: "Encaminhar"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getSendMessageMenu: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/Send", title:"Enviar", iconClass : '', primary: true},
            { route: "/Mail/Message/AddCcBcc", title:"Adicionar CC/BCC", iconClass : '', primary: false}
            ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getSendMessageMenuWithCC: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/Send", title:"Enviar", iconClass : '', primary: true},
            { route: "/Mail/Message/RemoveCcBcc", title:"Remover CC/BCC", iconClass : '', primary: false}
            ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getPrimaryAction: function() {
        var retVal = false;
        for (var i in this.models) {
          if (this.models[i].get('primary') == true) {
            //console.log(this.models[i].get("route"));
            retVal = this.models[i];
          }
        }
        return retVal;
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