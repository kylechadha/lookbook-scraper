var fs      = require('fs');
var path    = require('path');
var mime    = require('mime');
var async   = require('async');
var moment  = require('moment')
var scraper = require('./services/scraper')

//
// Routes
// -----------------------------------

module.exports = function(app) {

  // Index Route
  // ----------------------------------------------
  app.get('/', function(req, res) {
    res.render('layout');
  });


  // Scraper Route
  // ----------------------------------------------
  app.post('/', function(req, res, next) {

    var jsonData = {},
        csvData = { data : "name,url,neighborhood,cuisine,review_count,time_window\r\n" }

    // Use moment.js to manage time parsing.
    var resDateTime = moment(req.body.date, "MM/DD/YYYY HH:mm A"),
        resDate = resDateTime.format('YYYY-MM-DD'),
        resTime = resDateTime.format('HH:mm');

    var availableUrl = 'http://www.opentable.com/s/?datetime=' + resDate + '%20' + resTime + '&covers=' + req.body.people + '&metroid=4&regionids=5&showmap=false&popularityalgorithm=NameSearches&tests=EnableMapview,ShowPopularitySortOption,srs,customfilters&sort=Popularity&excludefields=Description&from=0',
        unavailableUrl = availableUrl + '&onlyunavailable=true';

    // Use async to scrape the available and unavailable restaurant locations.
    // Note: We're running these in series right now so the unavailable locations follow the available ones, but this could be run in parallel as well.
    async.series([

      // Send all the information to the scraper service we've defined in scraper.js
      function(callback) {
        scraper(availableUrl, jsonData, csvData, callback);
      },

      function(callback) {
        scraper(unavailableUrl, jsonData, csvData, callback);
      }

    ], function() {
      
      // Once scraping is complete, write the json and csv files.
      fs.writeFile('restaurants.json', JSON.stringify(jsonData, null, 4), function(error) {
        if (!error) {
          console.log('JSON file successfully written.')
        }
      });

      fs.writeFile('restaurants.csv', csvData['data'], function(error) {
        if (!error) {
          console.log('CSV file successfully written.')
        }
      })

      // Render the page with the restaurant data.
      res.render('layout', {restaurants: jsonData});

    });

  });


  // Download Route
  // ----------------------------------------------
  app.get('/download', function(req, res) {

    // Define the location of the csv file.
    var file = 'restaurants.csv';

    var filename = path.basename(file);
    var mimetype = mime.lookup(file);

    // Set headers.
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    // Serve the file to be downloaded.
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);

  });

};
