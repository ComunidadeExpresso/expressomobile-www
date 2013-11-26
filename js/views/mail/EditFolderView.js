define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/editFolderTemplate.html',
  'collections/mail/FoldersCollection'
], function($, _, Backbone, Shared, editFolderTemplate,FoldersCollection){

  var EditFolderView = Backbone.View.extend({

    parentFolderID: "",
    action: "addFolder",
    folderID: "",
    folderName : "Nova Pasta",
    parentFolderID: "INBOX",

    render: function(){

      this.elementID = "#content";

      var title = "";

      if (this.action == "addFolder") { 
        title = "Nova Pasta";
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

      Shared.forceSmartPhoneResolution = true;
      Shared.deviceType(Shared.isSmartPhoneResolution());

      Shared.menuView.renderContextMenu('editFolder', params);

      this.loaded();

    },

    saveFolder: function() {
      var folderAction = $("#folderAction").val();
      var folderName = $("#folderName").val();
      var folderID = $("#folderID").val();
      var parentFolderID = $("#parentFolderID").val();

      if (folderAction == "addFolder") { 

        var foldersCol =  new FoldersCollection();

        foldersCol.addFolder(folderName,parentFolderID).done(function (result) {

          console.log(result);

          var message = {
            type: "success",
            icon: 'icon-email',
            title: "Nova pasta adicionada com sucesso!",
            description: "",
            elementID: "#pageMessage",
          }

          Shared.showMessage(message);

          Shared.forceSmartPhoneResolution = false;
          Shared.deviceType(Shared.isSmartPhoneResolution());

          Shared.menuView.refreshFolders();

          Shared.router.navigate("/Mail/Folders/" + result.folderID ,{ trigger: true });

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

          Shared.showMessage(message);
          
        }).execute();

      }

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return EditFolderView;
  
});
