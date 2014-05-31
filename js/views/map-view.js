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
      this.listenTo( this.collections.stops, 'reset', this.update);
      Chaplin.mediator.subscribe('select:route', _.bind(this.showShape, this) );
    },

    postRender: function(){

      this.map = L.map('map');
      this.map.setView([0, 0], 2);
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: 'Map data &copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.sidebar = new SidebarView({
        map: this.map
      });

      this.collections.stops.fetch({reset:true});
      this.collections.shapes.fetch();
    
    },

    update: function(){
      var map = this.map,
          sidebar = this.sidebar,
          bounds = L.latLngBounds([]);
      this.collections.stops.forEach(function(stop){
        var lat = stop.get('stop_lat'), 
            lng = stop.get('stop_lon'),
            latlng = L.latLng(lat, lng),
            icon = L.icon({
              iconUrl: 'img/bus.png',
              iconRetinaUrl: 'img/bus@2x.png'
            });
        L.marker(latlng, {
          icon:icon
        }).on('click', function(){
            sidebar.open(stop);
         })
         .addTo(map);
        bounds.extend(latlng);
      });
      map.fitBounds(bounds);
    },

    showShape: function(shapeId){
      var shapes = this.collections.shapes.where({
        'shape_id':shapeId
      }), shape, latlngs;
      latlngs = _.map( shapes, function(model){
        return L.latLng(model.get('shape_pt_lat'), model.get('shape_pt_lon') );
      } );
      var polyline = L.polyline(latlngs, {color: 'red'}).addTo(this.map);
    }
  });

  return MapView;
});
