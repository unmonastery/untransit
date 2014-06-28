define(['views/base/view', 'text!templates/stop-time.hbs'], function(View, template) {
  'use strict';

  var StopTimeView = View.extend({
    template: template
  });

  return StopTimeView;
});
