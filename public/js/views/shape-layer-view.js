define([
  'chaplin',
  'underscore',
  'leaflet',
  'views/base/view'
], function(Chaplin, _, L,  View) {
  'use strict';

  function createIcon(zoom){
    if ( zoom > 15 ){
      return L.icon({
        iconUrl: '/img/bus-24.png',
        iconRetinaUrl: '/img/bus-24@2x.png',
        iconAnchor: [15, 15]
      });
    } else if ( zoom<=15 && zoom > 13 ) {
      return L.icon({
        iconUrl: '/img/bus-18.png',
        iconRetinaUrl: '/img/bus-18@2x.png',
        iconAnchor: [8, 8]
      });
    } else {
      return L.icon({
        iconUrl: '/img/bus-12.png',
        iconRetinaUrl: '/img/bus-12@2x.png',
        iconAnchor: [5, 5]
      });
    }

  }

  var ShapeLayerView = Chaplin.View.extend({

    initialize: function(options){
      _.extend( this, options );
      this.listenTo( this.models.shape, 'change', this.onShapeSelected );
    },

    onReady: function(map){
      this.map = map;
      this.layer = L.layerGroup().addTo(map);
    },

    onShapeSelected: function(){
      var latlngs;

      latlngs = _.map( this.models.shape.get('geometry'), function(model){
        return L.latLng(model['shape_pt_lat'], model['shape_pt_lon'] );
      });
      L.polyline(latlngs, {
        color: 'blue',
        weight:5,
        opacity:0.5
      }).addTo(this.map);
    }

  });

  return ShapeLayerView;

});
