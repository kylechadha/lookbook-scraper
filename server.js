//
// Server.js
// ----------------------------------------------


// Application Set Up
// ----------------------------------------------
var express = require('express');
var app     = express();
var path    = require('path');
var port    = process.env.PORT || 8080;

var morgan     = require('morgan');
var bodyParser = require('body-parser');
var session    = require('express-session');

var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var cheerio  = require('cheerio');
var async    = require('async');


// Configuration
// ----------------------------------------------
// mongoose.connect(configDB.url);


// Express Set Up
// ----------------------------------------------
app.use(morgan('dev'));
app.use(bodyParser());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');
app.use(express.static('public'));


// Routes
// ----------------------------------------------
require('./app/routes.js')(app);


// Server
// ----------------------------------------------
app.listen(port);
console.log('The magic happens on port ' + port);
