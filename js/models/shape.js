define([
  'models/base/model'
], function(Model) {
  'use strict';


  var Shape = Model.extend({

    name:'shape',
    collection:'shapes'
    
  });

  return Shape;
});