define([
  'underscore',
  'leaflet',
  'chaplin',
  'views/base/view',
  'views/sidebar-view',
  'models/base/collection',
  'models/stop',
  'models/shape',
  'text!templates/map.hbs'
], function(_, L, Chaplin, View, SidebarView, Collection, Stop, Shape, template) {
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

  function calculateSize(zoom){
    // 200 : 12, 10 : 18
    // assume linear, not best option!
    return  (-95*zoom+1740)/3;
  }

  var MapView = View.extend({
    // Automatically render after initialize
    autoRender: true,

    // Save the template string in a prototype property.
    // This is overwritten with the compiled template function.
    // In the end you might want to used precompiled templates.
    template: template,

    regions: {
      sidebar: '#sidebar-region'
    },

    initialize: function(options){
      _.extend( this, options );

      // keep track of markers and polylines
      this.markers = {};
      this.polylines = {};

      this.listenTo( this.collections.stops, 'reset', this.showStops);
      this.listenTo( this.collections.shapes, 'reset', this.showRoutes);
      this.listenTo( this.models.stop, 'change:stop_id', this.selectStop );
      this.listenTo( this.models.shape, 'change:shape_id', this.selectShape );

    },

    postRender: function(){

      var map, placeHolder, markers = this.markers;

      map = this.map = L.map('map');
      this.map.setView([40.666667,16.6], 2);
      L.tileLayer('http://a.tiles.mapbox.com/v3/elf-pavlik.map-qtc6poel/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom:12,
        attribution: 'Map data &copy; OpenStreetMap contributors'
      }).addTo(this.map);

      placeHolder = this.placeHolder = L.circle([0,0],
        calculateSize( this.map.getZoom() ),{
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5
      });

      // change icon size on zoom
      map.on('zoomend', function() {
        var currentZoom = map.getZoom(), key, marker;
        for (key in markers ){
          marker = markers[key];
          marker.setIcon( createIcon(currentZoom) );
        }
        placeHolder.setRadius( calculateSize(currentZoom) );
      });

      this.sidebar = new SidebarView({
        models: this.models,
        // region:'sidebar',
        map: map
      });

    },

    showStops: function(){
      var map = this.map,
          markers = this.markers,
          bounds = L.latLngBounds([]);

      this.collections.stops.forEach(function(stop){
        var marker, currentZoom = map.getZoom(),
        lat = stop.get('stop_lat'),
        lng = stop.get('stop_lon'),
        latlng = L.latLng(lat, lng);
        if (!markers[ stop.get('stop_id') ]){

          marker = L.marker(latlng, {
            icon:createIcon(currentZoom)
          })
          .on('contextmenu', function(e){ /* long click */
              // TODO do something
              // e.preventDefault();
          })
          .on('click', function(e){
            var now = new Date().getTime();
            Chaplin.mediator.publish('select:stop', stop.get('stop_id'));
            // e.preventDefault();
          }).addTo(map);
          markers[ stop.get('stop_id') ] = marker;
        }

        bounds.extend(latlng);

      });
      map.fitBounds(bounds);
    },

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
      var marker, key;
      for (key in this.markers){
        marker = this.markers[key];
        if ( key == stop.get('stop_id') ){
          this.map.panTo( marker.getLatLng() );
          this.placeHolder.setLatLng( marker.getLatLng() );
          this.placeHolder.addTo( this.map );
        }
      }
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
