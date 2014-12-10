define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/messagesListTemplate.html',
  'views/mail/MessagesListItemsView',
  'collections/mail/FoldersCollection',
  'collections/mail/MessagesCollection',
  'views/home/LoadingView',
  'views/mail/DetailMessageView',
], function($, _, Backbone, Shared, messagesListTemplate, MessagesListItemsView, FoldersCollection, MessagesCollection,LoadingView,DetailMessageView){

  var MessagesListView = Backbone.View.extend({

    currentFolder : [],
    parentFolders : [],
    elementID: "#content",
    detailElementID: "#contentDetail",
    folderID: 'INBOX',
    msgID: '',
    forceReload: "0",
    search: '',
    page: 1,
    doneRoute: '',

    render: function(){

      this.elementID = "#content";

      var that = this;

      var beforeRenderCallback = function(colection) {
        var newData = {
          folderID: that.folderID,
          msgID: that.msgID,
          currentFolder: that.currentFolder,
          collection: colection,
          _: _ 
        };

        if (!colection.length) {

          if (Shared.isTabletResolution()) {
            if (Shared.newMessageIntent) {
              Shared.newMessageIntent = false;
              Shared.router.navigate("/Mail/Message/New", {trigger: true});
            } else {
              Shared.router.navigate("/Mail/Messages/0/0/" + that.folderID + "#", {trigger: true});
            }
            
          }

        }

        var compiledTemplate = _.template( messagesListTemplate, newData );

        that.$el.html(compiledTemplate);

        $(that.elementID).empty().append(that.$el);

      }
      

      var doneFunction = function() { 

        if (Shared.newMessageIntent == false) {
          Shared.menuView.renderContextMenu('messageList',{folderID: that.folderID, folderName: that.currentFolder.folderName, folderType: that.currentFolder.get("folderType"), qtdMessages: 0});
        }

        if ( ((Shared.isTabletResolution()) && (that.forceReload == "1")) || ( (!Shared.isTabletResolution()) && (Shared.gotoRoute != false)) ) {

          if (Shared.newMessageIntent == true) {
            Shared.newMessageIntent = false;
            Shared.router.navigate("/Mail/Message/New", {trigger: true});
          } else {

            if (that.msgID != undefined) {

              var detailMessageView = new DetailMessageView();
              detailMessageView.folderID = that.folderID;
              detailMessageView.msgID = that.msgID;

              Shared.menuView.renderContextMenu('messageList',{folderID: that.folderID, folderName: that.currentFolder.folderName, folderType: that.currentFolder.get("folderType"), qtdMessages: 0});

              detailMessageView.render();
            }

          }

        }

        Shared.setDefaultIMListeners();

        that.loaded(); 
      };


      //FORCERELOAD IS A PARAMETER THAT FORCES THE PAGE TO BE RELOADED FULLY ON TABLET RESOLUTION OR DEPENDING ON USER INTERACTION WITH THE PAGE.
      //IN SMARTPHONE RESOLUTION THE FORCERELOAD IS USED TO NOT RELOAD ALL THE PAGE AND ONLY LOADS THE NECESSARY AREA OF THE PAGE.
      if (this.forceReload == "1") {

          var loadingView = new LoadingView({ el: $(this.elementID) });
          loadingView.render();

          var loadingView = new LoadingView({ el: $(this.detailElementID) });
          loadingView.render();

          that.getMessages(that.folderID,that.search,that.page,false,false,beforeRenderCallback,doneFunction);

      } else {

        var loadingView = new LoadingView({ el: $(this.detailElementID) });
        loadingView.render();

        var detailMessageView = new DetailMessageView();
        detailMessageView.folderID = that.folderID;
        detailMessageView.msgID = that.msgID;

        detailMessageView.render();

      }

      

    },

    events: {
      "keydown #searchField": "searchMessage"
    },

    searchMessage: function (e) {
      if(e.which == 13 && !e.shiftKey){
        this.search = $('#searchField').val();

        pullDownEl = document.getElementById('pullDown');
        pullDownEl.className = 'loading';
        pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Carregando...';
        
        this.pullDownAction();
      }
    },

    selectFirstMessage: function() {

      //ROTEIA PARA CARREGAR A PRIMEIRA MENSAGEM DA LISTA.
      var firstMessage = this.collection[0];
      if (firstMessage) {
        $("#" + firstMessage.listItemID()).addClass("selected");
        Shared.router.navigate(firstMessage.route(),{trigger: true});
      }
    },

    getMessages: function(pFolderID,pSearch,pPage,appendAtEnd,ignoreCache,beforeRenderCallback,doneCallback)
    {

      var messagesData = new MessagesCollection();
      var foldersCollection = new FoldersCollection();



      var that = this;

      foldersCollection.getFolders(this.folderID,this.search).done( function (foldersData) {


        var currentFolder = foldersData.getFolderByID(that.folderID);
        var parentFolders = foldersData.getSubFoldersFromFolderID(that.folderID);

        that.currentFolder = currentFolder;
        that.parentFolders = parentFolders;

        if (ignoreCache == true) {
          messagesData.ignoreCache(true);
        }


            messagesData.getMessagesInFolder(pFolderID,'',pSearch,pPage).done(function(data){

                    if (appendAtEnd == true) {

                    }

                    that.collection = data.models;

                    if (beforeRenderCallback) {
                      beforeRenderCallback(that.collection);
                    }

                    var messagesListItemsView = new MessagesListItemsView({ el: $("#scrollerList"), collection: data , parentFolders: that.parentFolders });
                    if (!appendAtEnd) {
                      messagesListItemsView.parentFolders = that.parentFolders;
                    } else {
                      messagesListItemsView.parentFolders = [];
                    }
                    
                    if ((that.msgID == "") || (that.msgID == "0"))  {
                      if (data.length) {
                        if (Shared.isTabletResolution()) {
                          that.msgID = data.models[0].get("msgID"); 
                        }
                      }
                    }
                    messagesListItemsView.msgIDSelected = that.msgID;

                    messagesListItemsView.render(appendAtEnd);

                    if (doneCallback) {
                      doneCallback();
                    }

                    var top = $('.topHeader').outerHeight(true);
                    var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
                    
                    $('body').height($(window).height() - top);
                    $('#wrapper').css('top', top + search);

                    Shared.scrollerRefresh();

            })
            .fail(function(result){
              
              Shared.handleErrors(result.error);

              $(that.elementID).empty();

              $(that.detailElementID).empty();
              
              return false;
            })
            .execute();

      })
      .fail(function(result){

        Shared.handleErrors(result.error);

        $(that.elementID).empty();

        $(that.detailElementID).empty();

        return false;
      })
      .execute();

      
    },

    pullDownAction: function () 
    {
      this.page = 1;
      this.getMessages(this.folderID,this.search,this.page,false,true);
    },

    pullUpAction : function() 
    {
      this.page = this.page + 1;
      this.getMessages(this.folderID,this.search,this.page,true,false);
    },

    loaded: function () 
    {
      pullDownEl = document.getElementById('pullDown');
      pullDownOffset = pullDownEl.offsetHeight;
      pullUpEl = document.getElementById('pullUp'); 
      pullUpOffset = pullUpEl.offsetHeight;

      var that = this;
      Shared.scroll = new iScroll('wrapper',
      {
        useTransition: true,
        topOffset: pullDownOffset,
        onRefresh: function () 
        {
          if (pullDownEl.className.match('loading')) 
          {
            pullDownEl.className = '';
            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
          }
          else if (pullUpEl.className.match('loading')) 
          {
            pullUpEl.className = '';
            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
          }
        },
        onScrollMove: function () 
        {
          if (this.y > 5 && !pullDownEl.className.match('flip')) 
          {
            pullDownEl.className = 'flip';
            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Solte para atualizar...';
            this.minScrollY = 0;
          } 
          else if (this.y < 5 && pullDownEl.className.match('flip')) 
          {
            pullDownEl.className = '';
            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Puxe para baixo para atualizar...';
            this.minScrollY = -pullDownOffset;
          } 
          else if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) 
          {
            pullUpEl.className = 'flip';
            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Solte para carregar mais...';
            this.maxScrollY = this.maxScrollY;
          } 
          else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) 
          {
            pullUpEl.className = '';
            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Puxe para cima para carregar mais...';
            this.maxScrollY = pullUpOffset;
          }
        },
        onScrollEnd: function () 
        {
          if (pullDownEl.className.match('flip')) 
          {
            pullDownEl.className = 'loading';
            //pullDownEl.querySelector('.pullDownIcon').style = 'width: 0px; height; 0px;';
            pullDownEl.querySelector('.pullDownLabel').innerHTML = 'Carregando...';
            that.pullDownAction(); 
          }
          else if (pullUpEl.className.match('flip')) 
          {
            pullUpEl.className = 'loading';
            //pullUpEl.querySelector('.pullDownIcon').style = 'width: 0px; height; 0px;';
            pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Carregando...';
            that.pullUpAction(); 
          }
        } 
      });
    }
  });

  return MessagesListView;
  
});
