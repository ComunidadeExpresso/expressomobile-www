define([
  'underscore',
  'backbone',
  'shared',
  'models/mail/FoldersModel',
], function(_, Backbone, Shared, FoldersModel){

  var FoldersCollection = Backbone.Collection.extend({
      
      model: FoldersModel,

      diskSizeUsed: 0,
      diskSizeLimit: 0,
      diskSizePercent: 0,

      _data: {},

      done: function (value) {
        this._data.done = value;
        return this;
      },

      fail: function (value) {
        this._data.fail = value;
        return this;
      },

      currentFolder: '',
      currentSearch: '',

      initialize : function(models, options) {
        this.api = Shared.api;
        this.model = FoldersModel;

        this.diskSizeUsed = 0;
        this.diskSizeLimit = 0;
        this.diskSizePercent = 0;

      },

      getSubFoldersFromFolderID: function(PfolderID) {
        var result = [];
        _.each(this.models, function(folder){
          if (folder.get("folderParentID") == PfolderID) {
            result.push(folder);
          }
        });
        return result;
      },

      getFolderByID: function(PfolderID) {
        var result = [];
        _.each(this.models, function(folder){
          if (folder.get("folderID") == PfolderID) {
            result = folder;
          }
        });
        return result;
      },

      addFolder: function(PfolderName,PparentFolderID) {
        var that = this;

        that._data = {};

        var thatModel = FoldersModel;

        var data = this._data;

        this.api
        .resource('/Mail/AddFolder')
        .params({folderName:PfolderName,parentFolderID:PparentFolderID})
        .done(function(result){

          if (that._data.done) { 
            that._data.done(result); 
          }
        })
        .fail( function (error) {
          if (that._data.fail) { 
            that._data.fail(error); 
          }
        });

        return that;

      },

      getFolders : function(PfolderID,Psearch) {

        var that = this;

        that._data = {};

        var thatModel = FoldersModel;

        var data = this._data;

        this.currentFolder = PfolderID;
        this.currentSearch = Psearch;

        this.api
        .resource('/Mail/Folders')
        .params({folderID:PfolderID,search:Psearch})
        .done(function(result){

          for (var i in result.folders) {

            var currentModel = new thatModel(result.folders[i]);

            that.add(currentModel);

          }

          that.diskSizeUsed = result.diskSizeUsed;
          that.diskSizeLimit = result.diskSizeLimit;
          that.diskSizePercent = result.diskSizePercent;

          if (that._data.done) { 
            that._data.done(that); 
          }
        })
        .fail( function (error) {
          if (that._data.fail) { 
            that._data.fail(error); 
          }
        });

        return that;

      },

      execute: function() {
        return this.api.execute();
      }


  });

  return FoldersCollection;

});