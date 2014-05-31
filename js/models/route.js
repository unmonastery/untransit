define([
  'models/base/model'
], function(Model) {
  'use strict';


  var Route = Model.extend({

  	name:'route',
    collection:'routes'
    
  });

  return Route;
});