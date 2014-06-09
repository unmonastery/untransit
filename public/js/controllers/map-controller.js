define([
  'controllers/base/controller',
  'views/map-view'
], function(Controller, MapView) {
  'use strict';

  var MapController = Controller.extend({
    show: function(params) {
      this.view = new MapView({
              region: 'main'
            });
    },
    showStops: function(params){
      this.view = new MapView({
              region: 'main',
              stopId:params.id
            });
    }
  });

  return MapController;
});
