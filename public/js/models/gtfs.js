define([
  'config/options',
  'jquery',
  'underscore'
], function(options,  $, _) {
  'use strict';

  // load GTFS data and store them on a local cache

  var  files = [ 'agency', 'calendar', 'calendar_dates',
                 'routes', 'stop_times', 'stops', 'trips', 'shapes' ],
       dataset = options.dataset,
       cache = {},
       gtfs = {};

  _.each( files, function(file){
    gtfs[file] = function(){
      var deferred = $.Deferred();
      if ( cache[file] ){
        deferred.resolve( cache[file] );
      } else {
        $.ajax({
          url:'/data/' + dataset + '/' + file + '.txt'
        }).done( function(data){
         var result = new CSV(data, { header: true, cast:false, line: '\n' }).parse();
         cache[file] = result;
         deferred.resolve(cache[file]);
        });
      }
      return deferred.promise();
    };
    // force initial uploading
    gtfs[file].call(undefined);
  });


  return gtfs;

});
