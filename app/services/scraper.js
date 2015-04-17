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
  }

  async.series([

    homePageRequest,

    function(callback) {
      async.each(users, function(user, callback) {

        request(user.lookbook_url, function(error, response, html) {
          if (!error) {

            console.log('Scraper running on Lookbook user page.');

            // Use Cheerio to load the page.
            var $ = cheerio.load(html);

            // Scrape the instagram info.
            var instagram_name = $('[data-page-track~="instagram"]').text();
            var instagram_url = $('[data-page-track~="instagram"]').attr('href');

            // Update the users array.
            var index = users.indexOf(user);
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
    },

    function(callback) {
      async.each(users, function(user, callback) {

        console.log(user.instagram_url);

        if (user.instagram_url) {
          request(user.instagram_url, function(error, response, html) {
            if (!error) {

              console.log('Scraper running on Instagram user page.');

              // Use Cheerio to load the page.
              var $ = cheerio.load(html);

              debugger;

              // Scrape the user info.
              var instagram_status = $('.UserProfileHeaderPrivate').length > 0 ? "private" : "public";
              var instagram_followers = $($('.sCount')[1]).text();
              var website = $($('.upuiBio span')[3]).find('a').attr('href');

              var instagram_info = $($('.upuiBio span')[1]).text(),
                infoArray = instagram_info.split(' '),
                cleanArray = [],
                email;

              console.log(instagram_status);
              console.log(instagram_followers);
              console.log(instagram_info);
              console.log(website);
              console.log('\n');

              infoArray.forEach(function(item) {
                item = item.replace(/\b[-.,()&$#!\[\]{}"']+\B|\B[-.,()&$#!\[\]{}"']+\b/g, "");
                cleanArray.push(item);
              })

              function validateEmail(email) {
                  var regexp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                  return regexp.test(email);
              }

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

  ], function() {
    
    users.forEach(function(user) {
      // Save the data in CSV format.
      csv['data'] = csv['data'] + '"' + user.name + '","' + user.location + '","' + user.country + '","' + user.lookbook_url + '","' + user.instagram_name + '","' + user.instagram_url + '",' + user.instagram_status + '",' + user.instagram_followers + '",' + user.website + '",' + user.email + '\r\n';

      // Save the data in JSON format.
      json[user.name] = {};
      json[user.name]['name'] = user.name ? user.name : "";
      json[user.name]['location'] = user.location ? user.location : "";
      json[user.name]['country'] = user.country ? user.country : "";
      json[user.name]['lookbookUrl'] = user.lookbook_url ? user.lookbook_url : "";
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
