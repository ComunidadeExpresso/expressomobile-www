({
    appDir: './',
    baseUrl: './js',
    dir: './dist',
    modules: [
        {
            name: 'main'
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        jquery: 'libs/jquery/jquery-min',
        underscore: 'libs/underscore/underscore-min',
        iscroll: 'libs/iscroll/src/iscroll',
        backbone: 'libs/backbone/backbone-min',
        localstorage: 'libs/Backbone.localStorage/backbone.localstorage',
        expressoAPI: 'libs/expresso/expressoAPI',
        expressoIM: 'libs/expresso/expressoIM',
        jqueryui: 'libs/jquery-ui/js/jquery-ui-1.10.3.custom.min',
        jquery_touchwipe: 'libs/jquery.touchwipe/jquery.touchwipe.min',
        jquery_dotdotdot: 'libs/jquery.dotdotdot/jquery.dotdotdot.min',
        jquery_xmpp: 'libs/jquery.xmpp/jquery.xmpp',
        moment: 'libs/moment/moment.min',
        json2: 'libs/json/json2',
        jqueryui_datepicker_ptBR: 'libs/jquery-ui/development-bundle/ui/i18n/jquery.ui.datepicker-pt-BR',
        templates: '../templates'
    },
    shim: {
        backbone: {
            deps: ['jquery','underscore'],
            exports: 'Backbone'
        },
        moment: {
            deps: ['jquery'],
            exports: 'moment'
        },
        underscore: {
            exports: "_"
        },
        jqueryui: {
            deps: ['jquery']
        },
        jquery_touchwipe: {
            deps: ['jquery']
        },
        jqueryui_datepicker_ptBR: {
            deps: ['jquery', 'jqueryui']
        }
    }
})