define([
  'underscore',
  'chaplin',
  'models/base/collection',
  'models/gtfs'
], function(_, Chaplin, Collection, storage) {
  'use strict';

  function one2many(name, to){
    var from = this;

    var query = {}, collection,
        fieldName = from.name + '_id',
        stopId = from.get( fieldName );
    query[ fieldName ] = stopId;
    collection = new Collection([], { query:query, model:to, reset:true } );
    from.listenTo( this, 'change:' + fieldName, function(){
      collection.query[fieldName] = from.get(fieldName);
    });
    from.listenTo( collection, 'reset', function(collection){
      from.set(name, collection.toJSON() );
    });
    return collection;
  };

  function one2one(name, to){
    var from = this;
    return function(){
      var model, query = {},
          oid = from.get( name + '_id' );
      if (!oid) return;
      query[ name + '_id' ] = oid;
      model = new to(query);
      from.listenTo( model, 'change', function(model){
        from.set( name, model.toJSON() );
      });
      return model;
    };
  };

  var Model = Chaplin.Model.extend({

    constructor: function(){
      Chaplin.Model.prototype.constructor.apply(this, arguments);
      var key, relation;
      this.relations = _.clone( this.relations );
      for (key in this.relations){
        relation = this.relations[key];
        if ( _.isArray( relation ) ){
          if ( relation.length > 0 ){
            this.relations[key] = one2many.call( this,  key, relation[0] );
          } else {
            throw 'Missing type for OneToMany relation ' + key + '.';
          }
        } else {
          this.relations[key] = one2one.call( this, key, relation );
        }
      }
    },

    fetch: function(options){
      var data, query = {}, model = this, key;
      if (!this.collection) return;
      query[ this.name + '_id' ] = this.get( this.name + '_id' );
      data = storage.get( this.collection );
      data = _.where(data, query );
      this.set(data[0], options);
      if (options && options.eager){
        if (!model.relations) return;
        for (key in model.relations){
          // TODO better: return model
          model.relations[ key ]().fetch({
            eager:true,
            success: function(item){
              model.set( key, item.toJSON() );
            }
          });
        }
      }
      if (options.success){
        options.success.call(this, this);
      }
    }

  });

  return Model;
});
