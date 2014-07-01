define([
  'config/options',
  'jquery',
  'underscore'
], function(options,  $, _) {
  'use strict';

  // load GTFS data and store them on localstorage

  var  files = [ 'agency', 'calendar', 'calendar_dates',
                 'routes', 'stop_times', 'stops', 'trips', 'shapes' ],
       dataset = options.dataset,
       GTFSModel = {
                singleton: null,
                getInstance: function() {
                   GTFSModel.singleton =  GTFSModel.singleton || {
                    get: function(name){
                      var singleton = GTFSModel.getInstance();
                      if (!singleton) return;
                      return singleton[name];
                    }
                   };
                   return GTFSModel.singleton;
                },
                load: function( callback ){
                    var singleton = GTFSModel.getInstance();

                    _.each(files, function(file){
                      $.ajax({
                        async:false,
                        dataType:'json',
                        url:'/json/' + dataset + '/' + file + '.txt'
                      }).done( function(data){
                       singleton[file] = data;
                     });
                    });


                    callback.call(this);
                }

        };

  return GTFSModel;

});
