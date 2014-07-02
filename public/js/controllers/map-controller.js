define([
  'chaplin',
  'controllers/base/controller',
  'views/map-view',
  'views/layer-view',
  'views/sidebar-view',
  'models/base/collection',
  'models/stop',
  'models/shape'
], function(Chaplin, Controller, MapView, LayerView, SidebarView, Collection, Stop, Shape) {
  'use strict';

  var MapController = Controller.extend({

    initialize: function(){

      // keep track of current state

      this.collections = {
        stops: new Collection([], {
          model:Stop
        }),
        shapes: new Collection([], {
          model:Shape
        })
      };

      this.models = {
        stop: new Stop(),
        shape: new Shape()
      };

      Chaplin.mediator.subscribe('map:ready', _.bind(this.setMap, this) );
      Chaplin.mediator.subscribe('select:stop', _.bind(this.selectStop, this) );
      Chaplin.mediator.subscribe('select:shape', _.bind(this.selectShape, this) );
      Chaplin.mediator.subscribe('unselect:shape', _.bind(this.unselectShape, this) );

      $.unblockUI();
    },

    show: function(params) {

      this.views = {
        map: new MapView({
          collections: this.collections,
          models: this.models,
          region: 'main'
        }),
        stopLayer: new LayerView({
          collections: this.collections,
          models: this.models
        }),
        sidebar: new SidebarView({
          collections: this.collections,
          models: this.models
        })
      };

      this.views.map.render();

      // is the map ready when a stop is selected?
      if ( params.stopId ){
        this.selectStop( params.stopId );
      }
    },

    setMap: function(map){
      this.views.stopLayer.onReady(map);
      this.views.sidebar.onReady(map);
    },

    selectStop: function(stopId){
      window.history.pushState('stop_' + stopId, 'Fermata ' + stopId, '/stops/' + stopId);
      var stop = new Stop({'stop_id':stopId}), self = this;
      stop.fetch({
        success:function(){
          self.models.stop.set( stop.toJSON() );
        }
      });

    },

    selectShape: function(shapeId){
      var shape = this.collections.shapes.findWhere({'shape_id':shapeId});
      if (shape){
        this.models.shape.set( shape.toJSON() );
      }
    },

    unselectShape: function(){
      this.models.shape.clear();
    }

  });

  return MapController;
});
