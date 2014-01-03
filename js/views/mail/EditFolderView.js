define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/editFolderTemplate.html',
  'collections/mail/FoldersCollection'
], function($, _, Backbone, Shared, editFolderTemplate,FoldersCollection){

  var EditFolderView = Backbone.View.extend({

    action: "addFolder",
    folderID: "",
    folderName : "Nova Pasta",
    parentFolderID: "INBOX",

    render: function(){

      this.elementID = "#content";

      if (this.action == "renameFolder") { 
        title = "Renomear Pasta";

        var foldersCol =  new FoldersCollection();

        var that = this;

        foldersCol.getFolders(this.folderID,this.search).done( function (foldersData) {


          var currentFolder = foldersData.getFolderByID(that.folderID);

          that.folderName = currentFolder.get("folderName");

          that.renderView();


        }).fail(function(result){

          Shared.handleErrors(result.error);

          $(that.elementID).empty();

          $(that.detailElementID).empty();

          return false;
        })
        .execute();

      } else {
        this.renderView();
      }

      

    },

    renderView: function() {
      var title = "";

      if (this.action == "addFolder") { 
        title = "Adicionar Pasta";
      }

      if (this.action == "renameFolder") { 
        title = "Renomear Pasta";
      }

      var newData = {
        _: _,
        title: title,
        folderName: this.folderName,
        folderID: this.folderID,
        parentFolderID: this.parentFolderID,
        folderAction: this.action
      };

      var compiledTemplate = _.template( editFolderTemplate, newData );
      this.$el.html( compiledTemplate ); 

      $(this.elementID).empty().append(this.$el);

      var params = {};
      params.saveCallBack = this.saveFolder;
      params.parentCallBack = this;

      Shared.menuView.renderContextMenu('editFolder', params);

      this.loaded();
    },

    cleanTrash: function(folderID) {

      var foldersCol =  new FoldersCollection();

      foldersCol.cleanTrash().done(function (result) {

        var message = {
          type: "success",
          icon: 'icon-email',
          title: "Lixeira foi esvaziada com sucesso!",
          description: "",
          elementID: "#pageMessage",
        }

        Shared.showMessage(message);

        Shared.menuView.refreshFolders();

        Shared.router.navigate("/Mail/Messages/1/0/" + folderID + "#",{ trigger: true });


      }).fail(function (result) {

        var message = {
          type: "error",
          icon: 'icon-email',
          title: "Não foi possível esvaziar a lixeira!",
          description: "",
          elementID: "#pageMessage",
        }

        Shared.showMessage(message);

        Shared.router.navigate("/Mail/Messages/1/0/" + folderID + "#",{ trigger: true });
        
      }).execute();
    },

    saveFolder: function() {
      var folderAction = $("#folderAction").val();
      var folderName = $("#folderName").val();
      var folderID = $("#folderID").val();
      var parentFolderID = $("#parentFolderID").val();

      var foldersCol =  new FoldersCollection();

      if (folderAction == "addFolder") { 

        foldersCol.addFolder(folderName,parentFolderID).done(function (result) {

          var message = {
            type: "success",
            icon: 'icon-email',
            title: "Nova pasta adicionada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          }

          Shared.showMessage(message);

          Shared.deviceType(Shared.isSmartPhoneResolution());

          Shared.menuView.refreshFolders();

          Shared.router.navigate("/Mail/Messages/1/0/" + result.folderID + "#",{ trigger: true });

        }).fail(function (result) {

          var message = {
            type: "error",
            icon: 'icon-email',
            title: "Não foi possível adicionar esta pasta!",
            description: "",
            elementID: "#pageMessage",
          }

          if (result.error.code == "1011") { 
            message.title = "Não foi possível adicionar uma pasta com esse nome!";
          } 

          if (result.error.code == "1011") { 
            message.title = "Não foi possível adicionar uma pasta com esse nome!";
          } 

          Shared.showMessage(message);
          
        }).execute();

      }

      if (folderAction == "renameFolder") { 
        foldersCol.renameFolder(folderName,folderID).done(function (result) {

          var message = {
            type: "success",
            icon: 'icon-email',
            title: "Pasta renomeada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          }

          Shared.showMessage(message);

          Shared.deviceType(Shared.isSmartPhoneResolution());

          Shared.menuView.refreshFolders();

          Shared.router.navigate("/Mail/Messages/1/0/" + result.folderID + "#",{ trigger: true });

        }).fail(function (result) {

          var message = {
            type: "error",
            icon: 'icon-email',
            title: "Não foi possível renomear esta pasta!",
            description: "",
            elementID: "#pageMessage",
          }

          if (result.error.code == "1011") { 
            message.title = "Não foi possível adicionar uma pasta com esse nome!";
          } 

          Shared.showMessage(message);
          
        }).execute();

      }

    },

    deleteFolder: function(folderID) {

      var foldersCol =  new FoldersCollection();

      foldersCol.deleteFolder(folderID).done(function(result) { 

        var message = {
          type: "success",
          icon: 'icon-email',
          title: "A pasta foi excluída com sucesso!",
          description: "",
          elementID: "#pageMessage",
        }

        Shared.showMessage(message);
        Shared.menuView.refreshFolders();

        Shared.router.navigate("/Mail/Messages/1/0/INBOX#",{ trigger: true }); 

      }).fail(function (result) {

        var message = {
          type: "error",
          icon: 'icon-email',
          title: "Não foi possível excluir esta pasta!",
          description: "",
          elementID: "#pageMessage",
        }

        Shared.showMessage(message);
        
      }).execute();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

      Shared.deviceType(true);

    }
  });

  return EditFolderView;
  
});
