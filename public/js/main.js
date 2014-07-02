
require.config({

    baseUrl: '/js',

    // waiting timeout
    waitSeconds: 10,

    // Specify the paths of vendor libraries
    paths: {
      vendors:'../bower_components',
      jquery: '../bower_components/jquery/jquery',
      underscore: '../bower_components/lodash/dist/lodash',
      backbone: '../bower_components/backbone/backbone',
      bootstrap: '../bower_components/bootstrap/dist/js/bootstrap',
      handlebars: '../bower_components/handlebars/handlebars',
      leaflet: '../bower_components/leaflet/dist/leaflet',
      text: '../bower_components/requirejs-text/text',
      chaplin: '../bower_components/chaplin/chaplin',
      moment: '../bower_components/moment/moment',
      sidebar: '../lib/L.Control.Sidebar',
      easybtn:'../lib/easy-button'
    },
    // Underscore and Backbone are not AMD-capable per default,
    // so we need to use the AMD wrapping of RequireJS
    shim: {
      underscore: {
        exports: '_'
      },
      backbone: {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },
      handlebars: {
        exports: 'Handlebars'
      },
       easybtn: {
        deps: ['leaflet']
      },
      sidebar: {
        deps: ['leaflet']
      }
    }
    // For easier development, disable browser caching
    // Of course, this should be removed in a production environment
    // , urlArgs: 'bust=' +  (new Date()).getTime()
});

require(['application', 'routes'], function(Application, routes) {

  new Application({routes: routes, controllerSuffix: '-controller'});

});
