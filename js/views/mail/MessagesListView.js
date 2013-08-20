define([
  'jquery',
  'underscore',
  'backbone',
  'shared',
  'text!templates/mail/messagesListTemplate.html',
  'views/mail/MessagesListItemsView',
  'collections/mail/MessagesCollection',
  'views/home/LoadingView'
], function($, _, Backbone, Shared, messagesListTemplate, MessagesListItemsView, MessagesCollection,LoadingView){

  var MessagesListView = Backbone.View.extend({

    folderID: 'INBOX',
    msgID: '',
    search: '',
    page: 1,

    render: function(){

      var that = this;

      var beforeRenderCallback = function() {
        var newData = {
          folderID: that.folderID,
          _: _ 
        };

        var compiledTemplate = _.template( messagesListTemplate, newData );
        $("#content").html( compiledTemplate ); 
      }
      

      var doneFunction = function() { 
        console.log('HasDone'); 

        if (!Shared.isSmartPhone()) {
           that.selectFirstMessage(); 
        }

        that.loaded(); 
      };

      var loadingView = new LoadingView({ el: $("#content") });
      loadingView.render();

      var loadingView = new LoadingView({ el: $("#contentDetail") });
      loadingView.render();

      this.getMessages(this.folderID,this.search,this.page,false,beforeRenderCallback,doneFunction);

      Shared.setDefaultIMListeners();

      Shared.setCurrentView(1,this);

    },

    events: {
      "keydown #searchField": "searchMessage"
    },

    searchMessage: function (e) {
      if(e.which == 13 && !e.shiftKey){
        console.log("searchField");
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

    getMessages: function(pFolderID,pSearch,pPage,appendAtEnd,beforeRenderCallback,doneCallback)
    {

      var messagesData = new MessagesCollection();

      var that = this;

      messagesData.getMessagesInFolder(pFolderID,'',pSearch,pPage).done(function(data){

        that.collection = data.models;

        if (beforeRenderCallback) {
          console.log('beforeCallBack');
          beforeRenderCallback();
        }

        var messagesListItemsView = new MessagesListItemsView({ el: $("#scrollerList"), collection: data });
        messagesListItemsView.render(appendAtEnd);

        if (doneCallback) {
          console.log('doneCallback');
          doneCallback();
        }

        var top = $('.top').outerHeight(true);
        var search = $('.searchArea').outerHeight(true) == null ? 0 : $('.searchArea').outerHeight(true);
        
        $('body').height($(window).height() - top);
        $('#wrapper').css('top', top + search);

        Shared.refreshDotDotDot();
        Shared.scrollerRefresh();

      })
      .fail(function(result){
        if (result.error.code == 7) {
          Shared.router.navigate('Login',{trigger: true});
          alert("Sua sessão expirou.");
        }
        
        return false;
      })
      .execute();
    },

    pullDownAction: function () 
    {
      console.log('pullDownAction');
      this.page = 1;
      this.getMessages(this.folderID,this.search,this.page,false);
    },

    pullUpAction : function() 
    {
      this.page = this.page + 1;
      this.getMessages(this.folderID,this.search,this.page,true);
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
