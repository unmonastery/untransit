define([
  'chaplin',
  'controllers/base/controller',
  'views/map-view',
  'models/base/collection',
  'models/stop',
  'models/shape'
], function(Chaplin, Controller, MapView, Collection, Stop, Shape) {
  'use strict';

  var MapController = Controller.extend({

    initialize: function(){
      this.collections = {
        stops: new Collection([], {
          model:Stop
        }),
        shapes: new Collection([], {
          model:Shape
        })
      };
      // keep track of current selected items
      this.models = {
        stop: new Stop(),
        shape: new Shape()
      };

      Chaplin.mediator.subscribe('select:stop', _.bind(this.selectStop, this) );
      Chaplin.mediator.subscribe('select:shape', _.bind(this.selectShape, this) );
      Chaplin.mediator.subscribe('unselect:shape', _.bind(this.unselectShape, this) );

      $.unblockUI();
    },

    show: function(params) {
      var models = this.models;

      if ( !this.view ){
        this.view = new MapView({
          collections: this.collections,
          models: this.models,
          region: 'main'
        });
      }

     this.collections.stops.fetch({
        reset:true,
        success:function(collection){
          var stopId = params.stopId,
              stop;
          if (stopId){
            stop = collection.findWhere({'stop_id':stopId});
            if (stop){
              models.stop.set( stop.toJSON() );
            } else {
              alert('No stop found with id ' + stopId);
            }
          }
        }
      });
      this.collections.shapes.fetch({reset:true});
    },

    selectStop: function(stopId){
      this.show({ stopId: stopId });
      window.history.pushState('stop_' + stopId, 'Fermata ' + stopId, '/stops/' + stopId);
      // Chaplin.utils.redirectTo({url: '/stops/' + stopId});
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
