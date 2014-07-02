define([
  'models/base/model',
  'models/gtfs'
], function(Model, gtfs) {
  'use strict';


  var
    storage = gtfs.getInstance(),
    Shape = Model.extend({

    name: 'shape',
    collection: 'shapes',
    fetch: function(options){
      // shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence
      var data = storage.get( this.collection );
      data = _.where(data, {
        'shape_id': this.get('shape_id').toString()
      });
      this.set('geometry', data);
    }

  });

  return Shape;
});
