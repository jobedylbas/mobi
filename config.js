/* Chamando os módulos e executando-os */
var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongoTriggers = require('mongo-trigger');
var favicon = require('serve-favicon');
var path = require('path');

var app = express();

/* Setting the view engine of express as ejs*/
app.set('view engine', 'ejs');
/* Setting the stantard view folder */
app.set('views', path.join(__dirname,'views'));

/* Use public as static default directory */
app.use(express.static(path.join(__dirname,'public')));

/* Configuring body-parser middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* Configuring expressValidator middleware */
app.use(expressValidator());

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/* Autoloads of routes, models and controllers */
consign()
  .include('routes')
  .then('models')
  .then('controllers')
  .then('db/dbConnection.js')
  .into(app);

module.exports = app;
