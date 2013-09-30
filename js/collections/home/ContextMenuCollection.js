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

      getMailSignatureMenu: function(folderID) {
        var menuItems = [
            { route: "/Settings/SaveMailSignature", title:"Salvar", primary: true}
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

      getGeneralContactsMenu: function() {
        var menuItems = [
            { route: "/Contacts/Personal", iconClass: 'context-catalogo-pessoal', title:"Contatos Pessoais"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getPersonalContactsMenu: function() {
        var menuItems = [
            { route: "/Contacts/General", iconClass: 'context-catalogo-geral', title: "Catálogo Geral"}
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getDetailsContactMenu: function(email) {
        var menuItems = [
            { route: "/Mail/Message/New/" + email, title:"Nova Mensagem", iconClass : 'btn-compose', primary: true},
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getCalendarMenu: function(year, month, day) {

        var today = new Date();
        var pad = "00";

        if (year == '' || year == undefined)
          year = today.getFullYear();

        if (month == '' || month == undefined)
        {
          month = today.getMonth() + 1; // Months are zero based;
          month = pad.substring(0, pad.length - ("" + month).length) + ("" + month);
        }

        if (day == '' || day == undefined)
          day = today.getDate();

        var menuItems = [
            { route: "/Calendar/Events/Add/" + year + "/" + month + "/" + day, title:"Adicionar evento", primary: true }
          ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getCalendarAddEventMenu: function ()
      {
        var menuItems = [
            // { route: "/Calendar/Events/Save", title:"Salvar", iconClass : '', primary: true},
            { route: "", title:"Salvar", iconClass : '', primary: true},
            // { route: "/Calendar/Events/AddParticipants", title:"Adicionar participantes", iconClass : '', primary: false}
            { route: "", title:"Adicionar participantes", iconClass : 'context-catalogo-geral', primary: false, action: 'addParticipants'}
            ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getCalendarDetailsEventMenu: function (eventID, year, month, day)
      {
        var today = new Date();
        var pad = "00";

        if (year == '' || year == undefined)
          year = today.getFullYear();

        if (month == '' || month == undefined)
        {
          month = today.getMonth() + 1; // Months are zero based;
          month = pad.substring(0, pad.length - ("" + month).length) + ("" + month);
        }

        if (day == '' || day == undefined)
          day = today.getDate();

        var menuItems = [
            { route: "/Calendar/Events/Edit/" + eventID, title:"Editar evento", iconClass : '', primary: true},
            { route: "/Calendar/Events/Add/" + year + "/" + month + "/" + day, title:"Adicionar evento", iconClass : '', primary: false, action: 'add'},
            { route: "/Calendar/Events/Delete/" + eventID + "/" + year + "/" + month + "/" + day, title:"Excluir evento", iconClass : '', primary: false, action: 'delete'}
            ];

        this.createModelsFromArray(menuItems);
        return this;
      },

      getCalendarAddEventParticipantMenu: function ()
      {
        var menuItems = [
            { route: "", title:"Salvar", iconClass : '', primary: true}
            ];

        this.createModelsFromArray(menuItems);
        return this;
      }

  });

  return ContextMenuCollection;

});