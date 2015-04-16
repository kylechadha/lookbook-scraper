var fs      = require('fs');
var path    = require('path');
var mime    = require('mime');
// var async   = require('async');
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
        csvData = { data : "name,location,ig_name,ig_url,ig_status,ig_followers,email\r\n" },
        url = 'http://lookbook.nu/north-america';

    // Use async to scrape the available and unavailable restaurant locations.
    // Note: We're running these in series right now so the unavailable locations follow the available ones, but this could be run in parallel as well.
    async.series([

      // Send all the information to the scraper service we've defined in scraper.js
      function(callback) {
        scraper(availableUrl, jsonData, csvData, callback);
      }

    ], function() {
      
      // Once scraping is complete, write the json and csv files.
      fs.writeFile('looks.json', JSON.stringify(jsonData, null, 4), function(error) {
        if (!error) {
          console.log('JSON file successfully written.')
        }
      });

      fs.writeFile('looks.csv', csvData['data'], function(error) {
        if (!error) {
          console.log('CSV file successfully written.')
        }
      })

      // Render the page with the restaurant data.
      res.render('layout', {looks: jsonData});

    });

  });


  // Download Route
  // ----------------------------------------------
  app.get('/download', function(req, res) {

    // Define the location of the csv file.
    var file = 'looks.csv';

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
