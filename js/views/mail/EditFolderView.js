define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/editFolderTemplate.html'
], function($, _, Backbone, Shared, editFolderTemplate){

  var EditFolderView = Backbone.View.extend({

    parentFolderID: "",
    action: "addFolder",

    render: function(){

      this.elementID = "#content";

      var title = "";

      if (action == "addFolder") { 
        title = "Nova Pasta";
      }

      if (action == "renameFolder") { 
        title = "Renomear Pasta";
      }

      var newData = {
        _: _ 
      };

      var compiledTemplate = _.template( editFolderTemplate, newData );
      this.$el.html( compiledTemplate ); 

      $(this.elementID).empty().append(this.$el);

      this.loaded();

    },

    loaded: function () 
    {

      var that = this;
      Shared.scrollDetail = new iScroll('wrapperDetail');

    }
  });

  return EditFolderView;
  
});
