// Filename: shared.js
define([
  'jquery',
  'underscore',
  'backbone',
  'expressoAPI',
  'expressoIM',
  'views/home/UserMessageView',
  'expressoService',
], function($, _, Backbone,expressoAPI,expressoIM,UserMessageView,expressoService) {
  
  var Shared = {};

  Shared.betaVersion = true;

  Shared.betaTesters = [];

  if (Shared.betaVersion) {
    Shared.appVersion = "BETA";
  } else {
    Shared.appVersion = "1.0";
  }

  Shared.apiVersion = '';
  Shared.expressoVersion = '';

  Shared.context = "/api/";

  Shared.settings = {};

  Shared.settings.resultsPerPage = 25;
  Shared.settings.mailSignature = "Mensagem enviada pelo Expresso Mobile.";

  Shared.timeoutDelay = 500;

  Shared.scrollDetail = null;
  Shared.scroll = null;
  Shared.scrollMenu = null;

  Shared.lastCheckDate = null;

  Shared.forceSmartPhoneResolution = false;
  

  Shared.im = expressoIM;
  Shared.api = expressoAPI;
  Shared.service = expressoService;

  Shared.contentView = null;
  Shared.detailView = null;

  //USED WHEN THE ANDROID SEND FILES AND OPENS A NEW COMPOSE MESSAGE.
  Shared.gotoRoute = false;
  Shared.newMessageIntent = false;
  Shared.newMessageFiles = true;

  //MAXIMUM ALLOWED UPLOAD FILES IN ATTACHMENTS
  Shared.max_upload_file_size = 10240; //IN KBYTES

  //MAXIMUM QUANTITY OF FILES IN EVERY MESSAGE.
  Shared.max_upload_file_qtd = 20; //


  //MENSAGE THAT IT'S BEING COMPOSED.
  Shared.currentDraftMessage = '';



  //CHECKS IF THE DEVICE IS AN SMARTPHONE OR AN TABLET RESOLUTION
  Shared.isTabletResolution = function() {
    var retVal = ($(window).width() >= 720);
    if (Shared.forceSmartPhoneResolution) {
      retVal = false;
    }
    return retVal;
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

  Shared.bytesToSize = function(bytes, precision) {  
      var kilobyte = 1024;
      var megabyte = kilobyte * 1024;
      var gigabyte = megabyte * 1024;
      var terabyte = gigabyte * 1024;
     
      if ((bytes >= 0) && (bytes < kilobyte)) {
          return bytes + ' B';
   
      } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
          return (bytes / kilobyte).toFixed(precision) + ' KB';
   
      } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
          return (bytes / megabyte).toFixed(precision) + ' MB';
   
      } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
          return (bytes / gigabyte).toFixed(precision) + ' GB';
   
      } else if (bytes >= terabyte) {
          return (bytes / terabyte).toFixed(precision) + ' TB';
   
      } else {
          return bytes + ' B';
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

  Shared.refreshSettings = function() {

    Shared.api.resource('ExpressoVersion').params({}).done(function(result){

      Shared.apiVersion = result.apiVersion;
      Shared.expressoVersion = result.expressoVersion;

      if (Shared.apiVersion != "1.0") {
        Shared.api
        .resource('Preferences/UserPreferences')
        .params({"module": "mail"})
        .done(function(result){

          var rpp = 25;
          var mailsign = "Mensagem enviada pelo Expresso Mobile.";
          var typeSignature = "html";

          if (result.mail != undefined) {
            rpp = result.mail.max_email_per_page;
            mailsign = result.mail.signature;
            typeSignature = result.mail.type_signature;
          }

          Shared.settings.resultsPerPage = rpp;
          Shared.settings.mailSignature = mailsign;
          Shared.settings.typeSignature = typeSignature;

          Shared.saveSettingsToLocalStorage();


        }).fail(function(result) {

        }).execute();
      }

    }).fail(function(result) {

    }).execute();

  };

  Shared.showMessage = function( message) {
    var messageView = new UserMessageView();
    messageView.msgType = message.type;
    messageView.msgTitle = message.title;
    messageView.msgDescription = message.description;
    messageView.elementID = message.elementID;
    messageView.msgRoute = message.route;
    messageView.msgIcon = message.icon;
    messageView.timeout = message.timeout;
    if (message.animate == false) {
      messageView.animate = false;
    }
    messageView.render();
  };

  Shared.deviceType = function(smartphone) {
    if (smartphone) {
      $('body').addClass('smartphone');
      //$('#pageHeader').addClass('smartphone');
    } else { 
      $('body').removeAttr('class');
      //$('#pageHeader').removeClass('smartphone');
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

  Shared.saveSettingsToLocalStorage = function() {

    Shared.api.getLocalStorageValue("expresso",function(expressoValue) {

      expressoValue.settings = Shared.settings;

      Shared.api.setLocalStorageValue("expresso",expressoValue);

    });

  };

  Shared.handleErrors = function(error,preferences) {

    if (error.code == 100) {
      if (preferences != undefined) {

      }
      Shared.showMessage({
          type: "error",
          icon: 'icon-expresso',
          title: "Verifique sua conexão com a Internet...",
          description: "",
          timeout: 3000,
          elementID: "#pageMessage",
        });
    }

    if ((error.code == 7) || (error.code == 3)) {

      var expressoValues = {
        auth: "", 
        "profile": "",
        username: "", 
        password: "",
        phoneGap: "",
        serverAPI: "",
        settings: { 
          resultsPerPage: 30,
          automaticLogin: false,
          mailSignature: '',
        }
      };

      Shared.api.setLocalStorageValue("expresso",expressoValues);

      Shared.showMessage({
          type: "error",
          icon: 'icon-expresso',
          title: "Sua sessão expirou...",
          description: "",
          timeout: 0,
          elementID: "#pageMessage",
        });

        setTimeout(function() {

          Shared.router.navigate('Login',{trigger: true});

        },2000);

    }
  };

  Shared.scheduleCheckForNewMessages = function() {
    Shared.checkForNewMessages();
    setInterval(Shared.checkForNewMessages, 70000);
  };

  Shared.checkForNewMessages = function() {
    if (Shared.userHasModule("mail")) {

      Shared.api.resource('/Mail/Messages').params({folderID: "INBOX", search: ""}).done(function(result){

        var qtdUnreadMessages = 0;
        var lastMessage = '';

        var unreadMessages = [];

        _.each(result.messages, function(message){ 

          var date = moment(message.msgDate + ":59", "DD/MM/YYYY HH:mm:ss").unix();

          if (Shared.lastCheckDate != null) {

            if (date > (Shared.lastCheckDate / 1000)) {

              qtdUnreadMessages = qtdUnreadMessages + 1;
              lastMessage = message;

              unreadMessages.push(message);
            }

          }

        });

        if (qtdUnreadMessages > 0) {

          if (qtdUnreadMessages == 1) {

            Shared.showMessage({
              type: "chat-message",
              icon: 'icon-expresso',
              title: lastMessage.msgSubject,
              description: lastMessage.msgFrom.mailAddress,
              route: "/Mail/Messages/1/" +  lastMessage.msgID + "/INBOX",
              timeout: 5000,
              elementID: "#pageMessage",
            });

          } else {
            Shared.showMessage({
              type: "chat-message",
              icon: 'icon-expresso',
              title: "Você tem " + qtdUnreadMessages + " novas mensagens.",
              description: "",
              route: "/Mail/Messages/1/0/INBOX",
              timeout: 5000,
              elementID: "#pageMessage",
            });
          }

          Shared.menuView.setMailBadge(qtdUnreadMessages);
          
        }

        Shared.lastCheckDate = Date.now();

      }).fail(function(result) {

      }).execute();
    }
  };

  Shared.setDefaultIMListeners = function() {

    Shared.im.clearListeners();

    var onMessageFunction = function (message) { 

      Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());

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


  Shared.userHasModule = function(moduleName) {
    var retVal = false;
    var module = moduleName;
    var a = Shared.profile.contactApps;
    a.push("settings"); //EVERYONE HAS ACCESS TO SETTINGS.

    //CHECK IF THE CHAT SERVICE IS AVAILABLE AND ADD CHAT AS A MODULE.
    if (Shared.profile.contactServices != undefined) {
      if (Shared.profile.contactServices.chat != undefined) {
        a.push("chat");
      }
    }
    //a = ["settings"]; //USE THIS IF YOU WANT TO TEST SPECIFC MODULES WILL WORK INDIVIDUALY
    for (var i = 0; i < a.length; i++) {
      if (a[i] === moduleName) {
        retVal = true;
      }
    }
    if (Shared.apiVersion == "1.0") {
      if ((module == 'calendar') || (module == 'chat')) {
        retVal = false;
      }
    }
    return retVal;
    
  };

  Shared.userHasAuth = function() {
    Shared.api.getLocalStorageValue("expresso",function(expressoValue) {   

      //if (expressoValue != null) {

        var authValue = expressoValue.auth;

        if ((authValue != null) && (authValue != "")) {

          var profile = expressoValue.profile;

          Shared.profile = profile;

          //alert("auth:" + authValue);

          Shared.api.auth(authValue);

          if (Shared.isAndroid()) {
            Shared.service.setConfig("http://api.expresso.pr.gov.br/",authValue);
          }
          
        }

      //}

    });
  };

  Shared.userHasAuth();


document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

  // deviceready is PhoneGap's init event
document.addEventListener('deviceready', function () {

  Shared.api.phoneGap(true);
  Shared.api.android(Shared.isAndroid());

  if (Shared.isAndroid()) {

      Shared.service.service = cordova.require('cordova/plugin/ExpressoService');
      
      Shared.api.createPhoneGapDatabase();

      if (window.plugins.webintent != undefined) {
        window.plugins.webintent.getExtra("android.intent.extra.STREAM", function (url) {

          Shared.newMessageIntent = true;
          alert(url);
          Shared.newMessageFiles = eval(url);

          

        }, function() {

        });

        window.plugins.webintent.getExtra("android.intent.action.VIEW", function (url) {

          alert("view");
          alert(url);

        }, function() {

        });

      } else {
        //SEM WEBINTENT.
      }

  }

});

  var exitFunction = function(){

    window.location.href = "/";
    
  };

    if(window.onpagehide || window.onpagehide === null){
       window.addEventListener('pagehide', exitFunction, false);
    } else {
       window.addEventListener('unload', exitFunction, false);
    }

    window.onunload=exitFunction;

    window.onbeforeunload = function () {

      exitFunction();

    }; 



  //Shared.router is created in App.js

  return Shared;

});
