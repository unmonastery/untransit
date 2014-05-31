define(['chaplin', 'models/gtfs', '../lib/jquery.blockUI', 'models/stop'], function(Chaplin, gtfs, ui, Stop) {
 // 'use strict';

  function showBlockUi(){
        $.blockUI({ css: { 
                'z-index':9999,
                border: 'none', 
                padding: '15px', 
                backgroundColor: '#000', 
                '-webkit-border-radius': '10px', 
                '-moz-border-radius': '10px', 
                opacity: .5, 
                color: '#fff' 
            } });
    };

    function hideBlockUi(){
        $.unblockUI();
    };


  // The application object
  // Choose a meaningful name for your application
  var Application = Chaplin.Application.extend({
    // Set your application name here so the document title is set to
    // “Controller title – Site title” (see Layout#adjustTitle)
    title: 'unTransit',
    start: function() {
      var args = [].slice.call(arguments)
          self = this;
      gtfs.load(function(){
          Chaplin.Application.prototype.start.apply(self, args);
          /* stop = new Stop({
            stop_id:1
          });
          stop.on('change:times', function(model, values){
            console.log(values);
          });*/
      });
    }
  });

  window.Chaplin = Chaplin;

  return Application;
});
