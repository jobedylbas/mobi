/* Configuration of server */
var app = require('./config/server.js');

/* Initialize the server */
var server = app.listen(4000, function(){
  console.log("server: on");
});

// Create an websocket
var io = require('socket.io')(server);

// Setting var io as websocket.io function
app.set('io', io);

io.on('connection', function(){

	io.on('disconnect', function(){
	});
})
