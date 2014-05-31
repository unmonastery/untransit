define([
  'chaplin',
  'models/gtfs'
], function(Chaplin, gtfs) {
  'use strict';

  var storage = gtfs.getInstance(),
  Collection = Chaplin.Collection.extend({

    constructor: function(data, options){

      if (options){

          if (options.query){
            this.query = options.query;
          }
          if (options.model){
            this.model = options.model;
          }
      }
      Chaplin.Collection.prototype.constructor.call(this, data, options);
    },
    fetch: function(options){
      var data, self = this;
      if (!this.model) return;
      data = storage.get( this.model.prototype.collection );
      if (this.query){
        data = _.where(data, this.query);
      }

      this.reset(data, {reset:false});

      if (options && options.eager){
        this.forEach( function(model){
          model.fetch({eager:true});
        });
      }
        
      this.trigger('reset', this); 
      
    }
  });

  return Collection;
});
