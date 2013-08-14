// Filename: shared.js
define([
  'jquery',
  'underscore',
  'backbone',
  'expressoAPI',
  'expressoIM',
  //'collections/home/ExpressoCollection'
], function($, _, Backbone,expressoAPI,expressoIM) {
  
  var Shared = {};

  Shared.settings = {};

  Shared.timeoutDelay = 1000;

  Shared.scrollDetail = null;
  Shared.scroll = null;
  Shared.scrollMenu = null;

  Shared.settings.resultsPerPage = 30;

  Shared.im = expressoIM;
  Shared.api = expressoAPI;

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
