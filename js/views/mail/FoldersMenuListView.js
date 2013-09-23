define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'collections/mail/FoldersCollection',
  'text!templates/mail/foldersMenuListTemplate.html',
  'views/home/LoadingView'
], function($, _, Backbone, Shared, FoldersCollection, foldersMenuListTemplate,LoadingView){

  var FoldersMenuListView = Backbone.View.extend({
    el: $("#myFolders"),

    folderID: "INBOX",
    search: "",

    render: function(){
      
      var loadingView = new LoadingView({ el: $("#myFolders") });
      loadingView.render();

      this.getFolders(this.folderID,this.search);
 
    },

    

    getFolders: function (folderIDValue,searchValue) {

      var that = this;
      var collection = new FoldersCollection();

      collection
      .getFolders(folderIDValue,searchValue)
      .done(function (data) {
          
        that.collection = data.models;

        var newData = {
          folders: data.models,
          _: _
        }

        var compiledTemplate = _.template( foldersMenuListTemplate, newData );

        $("#myFolders").html( compiledTemplate ); 

        Shared.menuView.setQuota(data.diskSizeUsed,data.diskSizeLimit);

        /*
        if (doneCallBack) {
          console.log('doneCallback');
          doneCallback();
        } 
        */
        Shared.refreshDotDotDot();
        Shared.scrollerRefresh();

      })
      .fail(function (error) {
        Shared.handleErrors(error);
      })
      .execute();
    }

  });

  return FoldersMenuListView;
  
});
