define([
  'models/base/model',
  'models/base/collection',
  'models/trip'
], function(Model, Collection, Trip) {
  'use strict';


  var Time = Model.extend({

    relations: {
      trip:Trip
    },
    name: 'time',
    collection: 'stop_times'

  });

  return Time;
});
