define([
  'underscore',
  'backbone',
  'shared',
  'models/mail/MessagesModel'
], function(_, Backbone, Shared, MessagesModel){

  var MessagesCollection = Backbone.Collection.extend({
      
      model: MessagesModel,

      _data: {},

      done: function (value) {
        this._data.done = value;
        return this;
      },

      fail: function (value) {
        this._data.fail = value;
        return this;
      },

      currentPage: 1,
      currentFolder: '',
      currentSearch: '',
      _ignoreCache: false,

      ignoreCache: function (value) {
        this._ignoreCache = value;
        return this;
      },

      initialize : function(models, options) {
        this.api = Shared.api;
        this.model = MessagesModel;

      },

      getMessagesInFolder : function(PfolderID,PmsgID,Psearch,Ppage) {

        var that = this;

        that._data = {};

        var thatModel = MessagesModel;

        var data = this._data;

        this.currentFolder = PfolderID;
        this.currentSearch = Psearch;

        var pageToSearch = null;

        if (!Ppage) {
          pageToSearch = that.currentPage;
        } else {
          pageToSearch = Ppage;
          this.currentPage = 1;
        }

        this.api
        .resource('/Mail/Messages')
        .params({folderID:PfolderID,msgID:PmsgID,search:Psearch,resultsPerPage:Shared.settings.resultsPerPage,page:pageToSearch})
        .done(function(result){

          for (var i in result.messages) {

            var thisMessage = new thatModel(result.messages[i]);

            that.add(thisMessage);

          }

          if (that._data.done) { 
            that._data.done(that); 
          }

          if (PfolderID == "INBOX") {
            Shared.lastCheckDate = Date.now();
          }
        })
        .fail( function (error) {
          if (that._data.fail) { 
            that._data.fail(error); 
          }
        });

        if (this._ignoreCache) {
          console.log("ignoreCache");
          this.api.ignoreCache(true);
        }

        return that;

      },

      getMessageByID: function(PfolderID,PmsgID) {
        return this.getMessagesInFolder(PfolderID,PmsgID,'',1);
      },

      execute: function() {
        return this.api.execute();
      },

      getNextPage: function() {
        this.currentPage = this.currentPage + 1;
        return this.getMessagesInFolder(this.currentFolder,this.currentSearch,this.currentPage);
      }


  });

  return MessagesCollection;

});