var fs      = require('fs');
var path    = require('path');
var mime    = require('mime');
var async   = require('async');
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
        csvData = { data : "" },
        url = 'http://lookbook.nu/north-america';

    // Use async to ensure we write after the scraper is done.
    async.series([

      // Send all the information to the scraper service we've defined in scraper.js
      function(callback) {
        scraper(url, jsonData, csvData, callback);
      }

    ], function() {
      
      // Once scraping is complete, write the json and csv files.
      fs.writeFile('looks.json', JSON.stringify(jsonData, null, 4), function(error) {
        if (!error) {
          console.log('JSON file successfully created.')
        }
      });

      fs.exists('looks.csv', function(exists) { 
        if (exists) { 
          fs.readFile('looks.csv', 'utf8', function (error, data) {
            if (error) {
              return console.log(error);
            }

            // Append the new data to the original data.
            csvData['data'] = data + csvData['data'];

            // Write the file.
            fs.writeFile('looks.csv', csvData['data'], function(error) {
              if (error) {
                console.log(error);
              } else {
                console.log('CSV file successfully updated.')
              }
            })
          });
        } else {
          // Add column headers to the new data.
          csvData['data'] = 'name,location,country,lookbook_url,lookbook_blog,lookbook_site,instagram_name,instagram_url,instagram_status,instagram_followers,website,email\r\n' + csvData['data'];

          // Write the file.
          fs.writeFile('looks.csv', csvData['data'], function(error) {
            if (error) {
              console.log(error);
            } else {
              console.log('CSV file successfully created.')
            }
          })
        }
      }); 

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
