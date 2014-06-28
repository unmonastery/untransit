// from http://heu.io/posts/push-state-with-nodejs-and-express/

var express = require('express'),
    path = require('path'),
    port = process.env.PORT || 8080,
    app = express();

app.configure(function() {
  app.use(express.static(__dirname + '/public'));
});

app.get('*', function(request, response){
  response.sendfile('./public/index.html');
});

app.listen(port);
console.log("server started on port " + port);
