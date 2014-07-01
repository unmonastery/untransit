define([
  'chaplin',
  'models/gtfs'
], function(Chaplin, storage) {
  'use strict';

  var Collection = Chaplin.Collection.extend({

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
      storage[ this.model.prototype.collection ]
          .call(undefined)
          .done(function(data){
            if (self.query){
              data = _.where(data, self.query);
            }

            self.reset(data, {reset:false});

            if (options && options.eager){
              self.forEach( function(model){
                model.fetch({eager:true});
              });
            }

            self.trigger('reset', self);
            if (options.success){
              options.success.call(undefined, self);
            }
          });
      return this;
    }
  });

  return Collection;
});
