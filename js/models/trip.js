define([
  'models/base/model',
  'models/route'
], function(Model, Route) {
  'use strict';


  var Trip = Model.extend({

  	name:'trip',
    collection:'trips',
    relations:{
      route:Route
    }
    
  });

  return Trip;
});