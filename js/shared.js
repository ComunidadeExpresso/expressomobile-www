// Filename: shared.js
define([
  'jquery',
  'underscore',
  'backbone',
  'expressoAPI',
], function($, _, Backbone,expressoAPI) {
  
  var Shared = {};

  Shared.settings = {};

  Shared.scrollDetail = null;
  Shared.scroll = null;
  Shared.scrollMenu = null;

  Shared.settings.resultsPerPage = 30;

  Shared.api = expressoAPI;

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
    if (smartphone)
      $('body').addClass('smartphone');
    else 
      $('body').removeAttr('class');
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

  //AMBIENTE DE DEMONSTRAÇÃO SEM O PHONEGAP
  Shared.api.context("/api/").crossdomain("http://demo.expressolivre.org/api/rest").phoneGap(false);

  //AMBIENTE DE DEMONSTRAÇÃO COM O PHONEGAP
  //Shared.api.context("http://demo.expressolivre.org/api/rest").crossdomain("http://demo.expressolivre.org/api/rest").phoneGap(true);

  // SEM USAR PHONEGAP
  //Shared.api.context("/api/").crossdomain("http://api.expresso.pr.gov.br").phoneGap(false);
  

  //USANDO PHONEGAP
  //Shared.api.context("http://api.expresso.pr.gov.br/").crossdomain("http://api.expresso.pr.gov.br").phoneGap(true);
  

  Shared.api.id(0);
  Shared.api.debug(false);

  var authCookie = Shared.api.readCookie("auth");

  if ((authCookie != null) && (authCookie != "")) {

    var profile = JSON.parse(decodeURIComponent(Shared.api.read_cookie("profile")));

    Shared.profile = profile;

    Shared.api.auth(authCookie);
    
  }

  window.onunload = function(){
    if (Shared.api.auth()) { 
      window.location.href = "/Home";
    } else {
      window.location.href = "/Login";
    }
  }

  //Shared.router is created in App.js

  return Shared;

});
