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



  var LayerView = Chaplin.View.extend({

    initialize: function(options){
      _.extend( this, options );
      this.listenTo( this.collections.stops, 'reset', this.onReset );
    },

    onReady: function(map){
      this.map = map;
      this.layer = L.layerGroup().addTo(map);
      this.listenTo( map, 'zoomend', this.onBoundsChanged );
      this.listenTo( map, 'dragend', this.onBoundsChanged )
    },

    onReset: function(){
      var zoom = this.map.getZoom();

      this.collections.stops.forEach(
       function(stop){
        var lat = stop.get('stop_lat'),
            lng = stop.get('stop_lon'),
            latlng = L.latLng(lat, lng);
          L.marker(latlng, {
            icon:createIcon(zoom)
          }).on('click', function(e){
            Chaplin.mediator.publish('select:stop', stop.get('stop_id'));
          }).addTo(this.layer);
        }.bind(this));
    },

    onBoundsChanged: function(){
      var zoom = this.map.getZoom(),
          visibleStops,
          bounds;

      this.layer.clearLayers();

      if (zoom > 15 && zoom <= 18){
        bounds = this.map.getBounds();
        this.collections.stops.search(function(stop){
          var lat = stop.get('stop_lat'),
              lng = stop.get('stop_lon'),
              latlng = L.latLng(lat, lng);
          return bounds.contains(latlng);
        });
      }
    }



  });

  return LayerView;

});
