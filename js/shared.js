// Filename: shared.js
define([
  'jquery',
  'underscore',
  'backbone',
  'expressoAPI',
  'expressoIM',
  'views/home/UserMessageView',
], function($, _, Backbone,expressoAPI,expressoIM,UserMessageView) {
  
  var Shared = {};

  Shared.appVersion = "1.0";

  Shared.settings = {};

  Shared.timeoutDelay = 500;

  Shared.scrollDetail = null;
  Shared.scroll = null;
  Shared.scrollMenu = null;

  Shared.settings.resultsPerPage = 30;

  Shared.im = expressoIM;
  Shared.api = expressoAPI;

  Shared.contentView = null;
  Shared.detailView = null;

  //USED WHEN THE ANDROID SEND FILES AND OPENS A NEW COMPOSE MESSAGE.
  Shared.newMessageIntent = false;
  Shared.newMessageFiles = true;


  //MENSAGE THAT IT'S BEING COMPOSED.
  Shared.currentDraftMessage = '';

  Shared.im_url = "http://im.pr.gov.br:5280/http-bind";
  Shared.im_domain = "im.pr.gov.br";

  Shared.im.resource("NEW_RESOURCE").url(Shared.im_url).domain(Shared.im_domain);

  //CHECKS IF THE DEVICE IS AN SMARTPHONE OR AN TABLET RESOLUTION
  Shared.isTabletResolution = function() {
    return ($(window).width() >= 720);
  };
  Shared.isSmartPhoneResolution = function() {
    return !Shared.isTabletResolution();
  };

  //CHECKS IF THE USER IS IN A BROWSER IN A DESKTOP OR IN A PHONEGAP APPLICATION
  Shared.isDesktop = function() {
    var retVal = true;
    if (Shared.isPhonegap() || (Shared.isAndroid()) || (Shared.isIDevice())) {
      retVal = false;
    }
    return retVal;
  };
  Shared.isPhonegap = function() {
    return Shared.api.phoneGap();
  };

  //CHECKS IF THE DEVICE IS AN ANDROID OR AN IPHONE/IPAD DEVICE.
  Shared.isAndroid = function() {
    return (/android/gi).test(navigator.appVersion);
  };
  Shared.isIDevice = function() {
    return (/iphone|ipad/gi).test(navigator.appVersion);
  };

  Shared.scrollerRefresh = function () {
    if (Shared.scrollDetail) {
      Shared.scrollDetail.refresh();
    }
    if (Shared.scroll) {
      Shared.scroll.refresh();
    }
    if (Shared.scrollMenu) {
      Shared.scrollMenu.refresh();
    }
  };

  Shared.setCurrentView = function(type,view) {

    if (type == 1) {
      if (Shared.contentView != null) {
        Shared.contentView.undelegateEvents();
      }
      Shared.contentView = view;
    } else {
      if (Shared.isSmartPhoneResolution()) {
        if (Shared.contentView != null) {
          Shared.contentView.undelegateEvents();
        }
        Shared.contentView = view;
      } else {
        if (Shared.detailView != null) {
          Shared.detailView.undelegateEvents();
        }
        Shared.detailView = view;
      }
    }
  };

  Shared.showMessage = function( message) {
    var messageView = new UserMessageView();
    messageView.msgType = message.type;
    messageView.msgTitle = message.title;
    messageView.msgDescription = message.description;
    messageView.elementID = message.elementID;
    messageView.msgRoute = message.route;
    messageView.msgIcon = message.icon;
    messageView.render();
  };

  Shared.deviceType = function(smartphone) {
    if (smartphone) {
      $('body').addClass('smartphone');
      $('#pageHeader').addClass('smartphone');
    } else { 
      $('body').removeAttr('class');
      $('#pageHeader').removeClass('smartphone');
    }
  };

  Shared.refreshDotDotDot = function() {
    $(".ellipsis20").dotdotdot({
      ellipsis  : '... ',
      wrap    : 'word',
      height    : '20',
      tolerance : 0,
    });
    $(".ellipsis14").dotdotdot({
      ellipsis  : '... ',
      wrap    : 'word',
      height    : '14',
      tolerance : 0,
    });
    $(".ellipsis50").dotdotdot({
      ellipsis  : '... ',
      wrap    : 'word',
      height    : '50',
      tolerance : 0,
    });
  };

  Shared.handleErrors = function(error) {
    //alert(error);
    if (error.code == 7) {

      var expressoValues = {
        auth: "", 
        "profile": "",
        username: "", 
        password: "",
        phoneGap: "",
        serverAPI: ""
      };

      Shared.api.setLocalStorageValue("expresso",expressoValues);

      Shared.router.navigate('Login',{trigger: true});
      alert("Sua sessão expirou...");

      
    }
  };

  Shared.setDefaultIMListeners = function() {

    Shared.im.clearListeners();

    var onMessageFunction = function (message) { 
      Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());

      console.log(message);

      var message = {
        type: "chat-message",
        icon: 'icon-jabber',
        title: message.body,
        description: message.jid,
        route: "/Chat/" + message.id,
        elementID: "#pageMessage",
      }

      Shared.showMessage(message);
    };

    var onComposingFunction = function (message) { 

    };

    Shared.im.addOnMessageListener(onMessageFunction);
  };
  

  Shared.api.id(0);
  Shared.api.debug(false);

  var expressoValue = Shared.api.getLocalStorageValue("expresso");

  if (expressoValue != null) {

    var authValue = expressoValue.auth;

    if ((authValue != null) && (authValue != "")) {

      var profile = expressoValue.profile;

      Shared.profile = profile;

      Shared.api.auth(authValue);
      
    }

  }




  // deviceready is PhoneGap's init event
document.addEventListener('deviceready', function () {

  Shared.api.phoneGap(true);

  if (window.plugins.webintent != undefined) {
    window.plugins.webintent.getExtra("android.intent.extra.STREAM", function (url) {

      alert(url);

      Shared.newMessageIntent = true;
      Shared.newMessageFiles = url;

    }, function() {

    });

  } else {
    //SEM WEBINTENT.
  }

});

  window.onunload = function(){

    var expressoValue = Shared.api.getLocalStorageValue("expresso");

    if (expressoValue != null) {
      if (expressoValue.auth != "") { 
        window.location.href = "/Home";
      } else {
        window.location.href = "/Login";
      } 
    } else {
      window.location.href = "/Login";
    }
  }

  //Shared.router is created in App.js

  return Shared;

});
