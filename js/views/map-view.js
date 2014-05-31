define([
  'underscore',
  'leaflet',
  'views/base/view',
  'views/sidebar-view',
  'models/base/collection',
  'models/stop',
  'text!templates/map.hbs'
], function(_, L, View, SidebarView, Collection, Stop, template) {
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
        })
      };
      this.listenTo( this.collections.stops, 'reset', this.update);
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
    
    },

    update: function(){
      var map = this.map,
          sidebar = this.sidebar,
          bounds = L.latLngBounds([]);
      this.collections.stops.forEach(function(stop){
        var lat = stop.get('stop_lat'), 
            lng = stop.get('stop_lon'),
            latlng = L.latLng(lat, lng);
        L.marker(latlng)
         .on('click', function(){
            sidebar.open(stop);
         })
         .addTo(map);
        bounds.extend(latlng);
      });
      map.fitBounds(bounds);
    }
  });

  return MapView;
});
