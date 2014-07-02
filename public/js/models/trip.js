define([
  'models/base/model',
  'models/route',
  'models/shape'
], function(Model, Route, Shape) {
  'use strict';


  var Trip = Model.extend({

    name: 'trip',
    collection: 'trips',
    relations: {
      route: Route/* ,
      shape: Shape*/
    }

  });

  return Trip;
});
