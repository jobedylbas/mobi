/* importing o Mongodb */
var mongoClient = require('mongodb');

// Creating a connection for the server
var connMongo = function(){
  var db = new mongoClient.Db(
    'test',
    new mongoClient.Server(
      'localhost',
      27017,
      {}
    ),
    {}
  );
  return db;
}

module.exports = function(){
  return connMongo; // Returning the object of connection
}
