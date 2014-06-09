define([
  'models/base/model',
  'models/time'
], function(Model, Time) {
  'use strict';


  var Stop = Model.extend({

  	relations: {
  		times: [Time]
  	},
  	name:'stop',
    collection:'stops'
    
  });

  return Stop;
});