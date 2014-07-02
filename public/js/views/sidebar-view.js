define([
  'jquery',
  'moment',
  'chaplin',
  'sidebar',
  'views/base/view',
  'views/base/collection-view',
  'views/stoptime-view',
  'models/stop',
  'text!templates/sidebar.hbs',
  'text!templates/stop-time.hbs',
  'easybtn'
], function($, moment, Chaplin, sidebar, View, CollectionView, StopTimeView, Stop, template, timeTmpl) {
  'use strict';

  function isAboutNow( time ){
    var t = moment( time, 'HH:mm:ss'),
        now = moment( );

    t.date( now.date() );
    t.month( now.month() );
    t.year( now.year() );

    if ( t.isBefore(now) ){
      t.add(1, 'day');
    }

    if ( t.diff( now, 'minute' ) >= -10 && t.diff( now, 'minute' ) <= 10 ){
      return true;
    }

    return false;
  }


  var SidebarView = View.extend({
    // Automatically render after initialize
    autoRender: true,

    noWrap:true,

    region: 'sidebar',

    // Save the template string in a prototype property.
    // This is overwritten with the compiled template function.
    // In the end you might want to used precompiled templates.
    template: template,

    events: {
      'click .arrivals a': 'onSelectTrip'
    },

    regions: {
      arrivals: '#arrivals'
    },

    initialize: function(options){
      _.extend(this, options);

      this.model = this.models.stop;

      this.listenTo( this.model, 'change:stop_id', this.selectStop);

      var self = this;
      this.model.relations.times.comparator = function(time){
        return time.get('arrival_time');
      };

      View.prototype.pass.call(this, '#title', 'stop_name');
      View.prototype.pass.call(this, '#arrivals', 'times', timeTmpl);

      this.on('renderedSubview', function(){

        self.$('.arrivals a').each(function(index, item){
          var target = $(item), offset,
          value  = target.data('value');
          if ( isAboutNow(value) ){ // TOFIX
            offset = target.position().top;
            self.$('.arrivals').scrollTop(offset - 100);
          }
        });

      });

    },

    onReady: function(map){
      var self = this;

      this.map = map;

      this.sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'left'
      });
      this.map.addControl( this.sidebar );

      L.easyButton(
        'fa-info',
        function (){
          self.open();
        },
        '',
        this.map
      ).setPosition('topright');

    },

    open: function(stop){
      this.sidebar.show();
    },

    selectStop: function(stop){

      this.model.relations.times.fetch({
        eager:true
      });

      this.open();
    },

    close: function(){
      this.sidebar.close();
    },

    onSelectTrip: function(e){
      var target = $(e.currentTarget),
          shapeId = target.data('shape-id');
      this.$('.arrivals a.active').removeClass('active');
      target.addClass('active');
      Chaplin.mediator.publish('select:shape', shapeId);
      e.preventDefault();
    }


  });

  return SidebarView;
});
