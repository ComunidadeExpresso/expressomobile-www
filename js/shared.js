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
    $(".ellipsis").dotdotdot({
      ellipsis  : '... ',
      wrap    : 'word',
      height    : '20',
      tolerance : 0,
    });
  };

  Shared.api.context("/api/").crossdomain("http://demo.expressolivre.org/api/rest");
  //Shared.api.context("/api/").crossdomain("http://api.expresso.pr.gov.br");
  Shared.api.id(0);
  Shared.api.debug(false);

  var authCookie = Shared.api.readCookie("auth");

  if (authCookie != null) {

    var profile = JSON.parse(decodeURIComponent(Shared.api.read_cookie("profile")));

    //Shared.profile = profile;

    Shared.api.auth(authCookie);
    
  }

  //Shared.router is created in App.js

  return Shared;

});
