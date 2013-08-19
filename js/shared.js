// Filename: shared.js
define([
  'jquery',
  'underscore',
  'backbone',
  'expressoAPI',
  'expressoIM',
], function($, _, Backbone,expressoAPI,expressoIM) {
  
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

  //Shared.Expresso = ExpressoCollection;

  Shared.im_url = "http://im.pr.gov.br:5280/http-bind";
  Shared.im_domain = "im.pr.gov.br";

  Shared.im.resource("NEW_RESOURCE").url(Shared.im_url).domain(Shared.im_domain);

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
      if (Shared.isSmartPhone()) {
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

  Shared.isSmartPhone = function() {
    var retVal = false;
    if ($('body').hasClass('smartphone')) {
      retVal = true;
    }
    return retVal;
  }

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

  Shared.setDefaultIMListeners = function() {

    Shared.im.clearListeners();

    var onMessageFunction = function (message) { 
      Shared.menuView.setChatBadge(Shared.im.qtdUnreadMessages());
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
