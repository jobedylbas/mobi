/* Chamando os módulos e executando-os */
var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoTriggers = require('mongo-trigger')

var app = express();

/* Setting the view engine of express as ejs*/
app.set('view engine', 'ejs');

/* Setting the stantard view folder */
app.set('views', './app/views');

/* Set mongo-trigger as app variable*/
app.set('mongoTriggers', mongoTriggers)

/* Use public as static default directory */
app.use(express.static('./app/public'));

/* Configuring body-parser middleware */
app.use(bodyParser.urlencoded({extended: true}));

/* Configuring expressValidator middleware */
app.use(expressValidator());



/* Autoloads of routes, models and controllers */
consign()
  .include('app/routes')
  .then('app/models')
  .then('app/controllers')
  .then('config/dbConnection.js')
  .into(app);

module.exports = app;
