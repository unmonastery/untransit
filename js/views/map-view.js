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
              iconUrl: 'img/bus-24.png',
              iconRetinaUrl: 'img/bus-24@2x.png',
              iconAnchor: [15, 15]
            });
    } else if ( zoom<=15 && zoom > 13 ) {
      return L.icon({
              iconUrl: 'img/bus-18.png',
              iconRetinaUrl: 'img/bus-18@2x.png',
              iconAnchor: [8, 8]
            });
    } else {
      return L.icon({
              iconUrl: 'img/bus-12.png',
              iconRetinaUrl: 'img/bus-12@2x.png',
              iconAnchor: [5, 5]
            });
    }
    
  };

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

    initialize: function(){
      this.collections = {
        stops: new Collection([], {
          model:Stop
        }),
        shapes: new Collection([], {
          model:Shape
        })
      };

      this.markers = {};
      this.polylines = {};
      
      this.listenTo( this.collections.stops, 'reset', this.update);
      this.listenTo( this.collections.shapes, 'reset', this.showRoutes);
      Chaplin.mediator.subscribe('select:route', _.bind(this.highlightRoute, this) );
      Chaplin.mediator.subscribe('unselect:all', _.bind(this.lowlightAllRoutes, this) );
    },

    postRender: function(){

      this.map = L.map('map');
      this.map.setView([0, 0], 2);
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          minZoom:12,
          attribution: 'Map data &copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.sidebar = new SidebarView({
        map: this.map
      });

      this.collections.stops.fetch({reset:true});
      this.collections.shapes.fetch({reset:true});

      var map = this.map, markers = this.markers, marker;
      map.on('zoomend', function() {
        var currentZoom = map.getZoom(), key;
        for (key in markers ){
          marker = markers[key];
          marker.setIcon( createIcon(currentZoom) );
        }
      });
    
    },

    update: function(){
      var map = this.map, markers = this.markers,
          sidebar = this.sidebar,
          bounds = L.latLngBounds([]);
      this.collections.stops.forEach(function(stop){
        var marker, currentZoom = map.getZoom(),
            lat = stop.get('stop_lat'), 
            lng = stop.get('stop_lon'),
            latlng = L.latLng(lat, lng);
        if (!markers[ stop.get('stop_id') ]){
           marker = L.marker(latlng, {
            icon:createIcon(currentZoom)
          }).on('click', function(){
            sidebar.open(stop);
            map.panTo(latlng);
          })
          .addTo(map);
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
        } );
        polyline = L.polyline(latlngs, {
          color: 'blue',
          weight:2,
          opacity:0.3
        }).addTo(this.map);
        if (!this.polylines[key])
          this.polylines[key] = polyline;
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
