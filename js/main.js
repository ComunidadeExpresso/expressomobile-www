// Author: Thomas Davis <thomasalwyndavis@gmail.com>
// Filename: main.js

// Require.js allows us to configure shortcut alias
// Their usage will become more apparent futher along in the tutorial.
require.config({
  urlArgs: "bust=" + (new Date()).getTime(),
  paths: {
    jquery: 'libs/jquery/jquery-min',
    underscore: 'libs/underscore/underscore-min',
    iscroll: 'libs/iscroll/src/iscroll',
    backbone: 'libs/backbone/backbone-min',
    expressoAPI: 'libs/expresso/expressoAPI',
    jquery_touchwipe: 'libs/jquery.touchwipe/jquery.touchwipe.min',
    jquery_dotdotdot: 'libs/jquery.dotdotdot/jquery.dotdotdot.min',
    templates: '../templates'
  }

});

require([
  // Load our app module and pass it to our definition function
  'app',

], function(App){
  // The "app" dependency is passed in as "App"
  // Again, the other dependencies passed in are not "AMD" therefore don't pass a parameter to this function
  App.initialize();
});
