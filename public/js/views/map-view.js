define([
  'underscore',
  'leaflet',
  'chaplin',
  'views/base/view',
  'models/base/collection',
  'models/stop',
  'models/shape',
  'text!templates/map.hbs'
], function(_, L, Chaplin, View, Collection, Stop, Shape, template) {
  'use strict';

  var MapView = View.extend({
    // Automatically render after initialize
    // autoRender: true,

    // Save the template string in a prototype property.
    // This is overwritten with the compiled template function.
    // In the end you might want to used precompiled templates.
    template: template,

    initialize: function(options){
      _.extend( this, options );
      this.listenTo( this.models.stop, 'change:stop_id', this.selectStop );
      this.listenTo( this.models.shape, 'change:shape_id', this.selectShape );
    },

    postRender: function(){
      this.map = L.map('map');
      L.tileLayer('http://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom:12,
        attribution: 'Map data &copy; OpenStreetMap contributors'
      }).addTo(this.map);
      this.map.setView([40.666667,16.6], 12);
      Chaplin.mediator.publish('map:ready', this.map);
    },

    // TODO refactor
    showRoutes: function(){
      var key, groups = this.collections.shapes.groupBy('shape_id');
      var latlngs, polyline;
      for ( key in groups ){
        latlngs = _.map( groups[key], function(model){
          return L.latLng(model.get('shape_pt_lat'), model.get('shape_pt_lon') );
        });
        polyline = L.polyline(latlngs, {
          color: '#' + Math.floor(Math.random()*16777215).toString(16),
          weight:2,
          opacity:0.3
        }).addTo(this.map);
        if (!this.polylines[key])
          this.polylines[key] = polyline;
      }
    },

    selectStop: function(stop){
      var map = this.map;
      stop = stop || this.models.stop;

      // dirty fix, we need to wait for complete loading
      // map event 'load' is too early
      setTimeout(function(){
        map.panTo([ stop.get('stop_lat'), stop.get('stop_lon') ]);
        map.setZoom(18);
      }, 500);

    },

    selectShape: function(shape){
      var shapeId = shape.get('shape_id');
      if ( shapeId ){
        this.highlightRoute( shapeId );
      } else {
        this.lowlightAllRoutes();
      }

    },

    highlightRoute: function(shapeId){
      var polyline;

      this.lowlightAllRoutes();

      polyline = this.polylines[ shapeId ];
      polyline.setStyle({
        color:'red',
        weight:5,
        opacity:1
      });
    },

    lowlightRoute: function(shapeId){
      var polyline;
      polyline = this.polylines[ shapeId ];
      polyline.setStyle({
        color:'blue',
        weight:2,
        opacity:0.3
      });
    },

    lowlightAllRoutes: function(){
      var key;
      for (key in this.polylines){
        this.lowlightRoute( key );
      }
    }

  });

  return MapView;
});
