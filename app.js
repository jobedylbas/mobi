/* Configuration of server */
var path = require('path');
var app = require('./config.js');

/* Initialize the server */
var server = app.listen(3000, function(){
  console.log("server: on");
});