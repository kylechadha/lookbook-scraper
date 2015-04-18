var request    = require('request');
var cheerio    = require('cheerio');
var async      = require('async');

//
// Scraper Service
// -----------------------------------

module.exports = function(lookbookHomeUrl, json, csv, callback) {

  var users = [];

  // Load the Lookbook home page to be scraped.
  var homePageRequest = function(callback) {
    request(lookbookHomeUrl, function(error, response, html) {
      if (!error) {

        console.log('Scraper running on Lookbook index page.');

        // Use Cheerio to load the page.
        var $ = cheerio.load(html);

        // Iterate through looks.
        $('.look:not(:has(.premium_ad_container))').each(function() {

          var user = $(this),
              name,
              location,
              country,
              lookbook_url;

          // Scrape the user name and location.
          name = user.find('.subheader [data-track~="name"]').text();
          location = user.find('.subheader [data-track~="location"]').text();
          country = user.find('.subheader [data-track~="country"]').text();
          lookbook_url = 'http://lookbook.nu' + user.find('.subheader [data-track~="name"]').attr('href');

          // Push the data into the users array.
          users.push({
            name: name,
            location: location,
            country: country,
            lookbook_url: lookbook_url
          })

        });

      } else {
        callback(error);
      }

      callback(null);
    });
  };

  // Load the Lookbook user page to be scraped.
  var userPageRequest = function(callback) {

    // For each of the users, execute the requests in parallel with async.
    async.each(users, function(user, callback) {

      request(user.lookbook_url, function(error, response, html) {
        if (!error) {

          console.log('Scraper running on Lookbook user page.');

          // Use Cheerio to load the page.
          var $ = cheerio.load(html);

          // Scrape the instagram info.
          var lookbook_blog = $('[data-page-track~="blog"]').attr('href');
          var lookbook_site = $('[data-page-track~="website"]').attr('href');
          var instagram_name = $('[data-page-track~="instagram"]').text();
          var instagram_url = $('[data-page-track~="instagram"]').attr('href');

          // Update the users array.
          var index = users.indexOf(user);
          user.lookbook_blog = lookbook_blog;
          user.lookbook_site = lookbook_site;
          user.instagram_name = instagram_name;
          user.instagram_url = instagram_url;
          users[index] = user;

        } else {
          callback(error);
        }

        callback(null);
      });

    }, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
  };

  // Load the Instagram user page to be scraped.
  var igPageRequest = function(callback) {

    // For each of the users, execute the requests in parallel with async.
    async.each(users, function(user, callback) {

      if (user.instagram_url) {
        var options = {
          url: user.instagram_url,
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
          }
        };

        request(options, function(error, response, html) {
          if (!error) {

            console.log('Scraper running on Instagram user page.');

            // Use Cheerio to load the page.
            var $ = cheerio.load(html);

            // Scrape the user info.
            var instagram_status = $('.status-private').length > 0 ? "private" : "public";
            var instagram_followers = $($('.number-stat')[1]).text();
            var website = $('.user-bio a').attr('href');
            var instagram_info = $('.user-bio').text(),
              infoArray = instagram_info.split(' '),
              cleanArray = [],
              email;

            // Clean up the infoArray.
            infoArray.forEach(function(item) {
              // Strip trailing punctuation.
              item = item.replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "");

              // Strip newlines and line breaks.
              item = item.replace(/\r?\n|\r/g, '');
              cleanArray.push(item);
            })

            function validateEmail(email) {
                var regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return regexp.test(email);
            }

            // Find the email address.
            cleanArray.forEach(function(item) {
              if (validateEmail(item)) {
                email = item;
              }
            })

            // Update the users array.
            var index = users.indexOf(user);
            user.instagram_status = instagram_status;
            user.instagram_followers = instagram_followers;
            user.website = website;
            user.email = email;
            users[index] = user;

          } else {
            callback(error);
          }

          callback(null)
        })
      } else {
        callback(null);
      }


    }, function(err) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    })
  }

  // Execute each category of request in series.
  async.series([

    homePageRequest,
    userPageRequest,
    igPageRequest

  ], function() {
    
    users.forEach(function(user) {
      // Save the data in CSV format.
      csv['data'] = csv['data'] + '"' + user.name + '","' + user.location + '","' + user.country + '","' + user.lookbook_url + '","' + user.lookbook_blog + '","' + user.lookbook_site + '","' + user.instagram_name + '","' + user.instagram_url + '",' + user.instagram_status + '",' + user.instagram_followers + '",' + user.website + '",' + user.email + '\r\n';

      // Save the data in JSON format.
      json[user.name] = {};
      json[user.name]['name'] = user.name ? user.name : "";
      json[user.name]['location'] = user.location ? user.location : "";
      json[user.name]['country'] = user.country ? user.country : "";
      json[user.name]['lookbookUrl'] = user.lookbook_url ? user.lookbook_url : "";
      json[user.name]['lookbookBlog'] = user.lookbook_blog ? user.lookbook_blog : "";
      json[user.name]['lookbookSite'] = user.lookbook_site ? user.lookbook_site : "";
      json[user.name]['instagramName'] = user.instagram_name ? user.instagram_name : "";
      json[user.name]['instagramUrl'] = user.instagram_url ? user.instagram_url : "";
      json[user.name]['instagramStatus'] = user.instagram_status ? user.instagram_status : "";
      json[user.name]['instagramFollowers'] = user.instagram_followers ? user.instagram_followers : "";
      json[user.name]['website'] = user.website ? user.website : "";
      json[user.name]['email'] = user.email ? user.email : "";
    })

    // Let the router know we're done.
    callback(null);

  });

}
