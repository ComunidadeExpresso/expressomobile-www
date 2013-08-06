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

        if (!Ppage) {
           var pageToSearch = that.currentPage;
        } else {
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
      },

      getNextPage: function() {
        this.currentPage = this.currentPage + 1;
        return this.getMessagesInFolder(this.currentFolder,this.currentSearch,this.currentPage);
      }


  });

  return MessagesCollection;

});