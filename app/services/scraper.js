var request    = require('request');
var cheerio    = require('cheerio');
var async      = require('async');

//
// Scraper Service
// -----------------------------------

module.exports = function(lookbookHomeUrl, json, csv, callback) {

  var users = [];

  var homePageRequest = function(callback) {

    request(lookbookHomeUrl, function(error, response, html) {
      if (!error) {

        console.log('Response received. Scraper running on Lookbook index page.');

        // Use Cheerio to load the page.
        var $ = cheerio.load(html);

        // Iterate through the search results.
        $('.look:not(:has(.premium_ad_container))').each(function() {

          var user = $(this),
              name,
              location,
              country,
              lookbook_url,
              instagram_name,
              instagram_url,
              instagram_status,
              instagram_followers,
              email;

          // Scrape the user name and location.
          name = user.find('.subheader [data-track~="name"]').text();
          location = user.find('.subheader [data-track~="location"]').text();
          country = user.find('.subheader [data-track~="country"]').text();
          lookbook_url = 'http://lookbook.nu' + user.find('.subheader [data-track~="name"]').attr('href');

          users.push({
            name: name,
            location: location,
            country: country,
            lookbook_url: lookbook_url
          })

        });

      }
      else {
        callback(error);
      }

      callback(null)
    });
  }

  async.series([

    // Load the Lookbook home page to be scraped.
    function(callback) {
      console.log('function 1 before')
      homePageRequest(callback);
      console.log('function 1 after!')
    },

    function(callback) {
      console.log('function 2!')
      callback(null);
    }

  ], function() {
    
    console.log(users)

    users.forEach(function(user) {

      // Save the data in CSV format.
      csv['data'] = csv['data'] + '"' + user.name + '","' + user.location + '","' + user.country + '","' + user.lookbook_url + '","' + user.instagram_name + '","' + user.instagram_url + '",' + user.instagram_status + '",' + user.instagram_followers + '",' + user.email + '\r\n';

      // Save the data in JSON format.
      json[user.name] = {};
      json[user.name]['name'] = user.name;
      json[user.name]['location'] = user.location;
      json[user.name]['country'] = user.country;
      json[user.name]['lookbook_url'] = user.lookbook_url;
      json[user.name]['instagramName'] = user.instagram_name;
      json[user.name]['instagramUrl'] = user.instagram_url;
      json[user.name]['instagramStatus'] = user.instagram_status;
      json[user.name]['instagramFollowers'] = user.instagram_followers;
      json[user.name]['email'] = user.email;

    })

    // Let async know we're done.
    callback(null);

  });





}
