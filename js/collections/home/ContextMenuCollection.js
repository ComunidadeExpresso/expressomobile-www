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

      getMessagesListMenu: function(folderID) {
        var menuItems = [
            { route: "/Mail/Message/New", title:"Nova Mensagem", iconClass : 'btn-compose', primary: true},
            { route: "/Mail/Folder/New", title: "Nova Pasta", primary: false}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getResultsPerPageMenu: function(folderID) {
        var menuItems = [
            { route: "/Settings/SaveResultsPerPage", title:"Salvar", primary: true}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getDetailMessageMenu: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/New", title:"Nova Mensagem", iconClass : 'btn-compose', primary: true},
            { route: "/Mail/Message/ReplyMessage/" + msgID + "/" + folderID, iconClass : 'context-reply', title: "Responder"},
            { route: "/Mail/Message/ReplyToAll/" + msgID + "/" + folderID, iconClass : 'context-reply-all', title: "Responder p/ Todos"},
            { route: "/Mail/Message/Forward/" + msgID + "/" + folderID, iconClass : 'context-forward', title: "Encaminhar"},
            { route: "/Mail/Message/DelMessage/" + msgID + "/" + folderID, iconClass : 'context-delete-message', title: "Excluir"},
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getSendMessageMenu: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/Send", title:"Enviar", iconClass : '', primary: true},
            { route: "/Mail/Message/AddCcBcc", title:"Adicionar CC/BCC", iconClass : '', primary: false}
            ];

        var takePicture = {route: "/Mail/Message/AttachPicture", title: "Tirar Foto", iconClass: '', primary: false};

        if (Shared.isPhonegap()) {
          menuItems.push(takePicture);
        }

        this.createModelsFromArray(menuItems);
        return this;
      },

      getSendMessageMenuWithCC: function(folderID,msgID) {
        var menuItems = [
            { route: "/Mail/Message/Send", title:"Enviar", iconClass : '', primary: true},
            { route: "/Mail/Message/RemoveCcBcc", title:"Remover CC/BCC", iconClass : '', primary: false}
            ];

        var takePicture = {route: "/Mail/Message/AttachPicture", title: "Tirar Foto", iconClass: '', primary: false};

        if (Shared.api.phoneGap()) {
          menuItems.push(takePicture);
        }

        this.createModelsFromArray(menuItems);
        return this;
      },

      getPrimaryAction: function() {
        var retVal = false;
        for (var i in this.models) {
          if (this.models[i].get('primary') == true) {
            retVal = this.models[i];
          }
        }
        return retVal;
      },

      getContactsMenu: function() {
        var menuItems = [
            { route: "/Contacts/Personal", iconClass: 'context-catalogo-pessoal', title:"Contatos Pessoais"},
            { route: "/Contacts/General", iconClass: 'context-catalogo-geral', title: "Catálogo Geral"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getCalendarMenu: function() {
        var menuItems = [
            { route: "/Calendar/Events/Add", title:"Adicionar evento"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      }

  });

  return ContextMenuCollection;

});