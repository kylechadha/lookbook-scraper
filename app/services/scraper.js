var request    = require('request');
var cheerio    = require('cheerio');

//
// Scraper Service
// -----------------------------------

module.exports = function(queryUrl, json, csv, callback) {

  // Load the Lookbook URL to be scraped.
  request(queryUrl, function(error, response, html) {

    if (!error) {

      console.log('Response received. Scraper running.');

      // Use Cheerio to load the page.
      var $ = cheerio.load(html);

      // Iterate through the search results.
      $('.look:not(:has(.premium_ad_container))').each(function() {

        var user = $(this),
            name,
            location,
            country,
            ig_name,
            ig_url,
            ig_status,
            ig_followers,
            email;

        // Scrape the user name and location.
        name = user.find('.subheader [data-track~="name"]').text();
        location = user.find('.subheader [data-track~="location"]').text();
        country = user.find('.subheader [data-track~="country"]').text();

        // // Scrape the Neighborhood and Cuisine Type.
        // content = user.find('.rest-content div').text().split('|');
        // neighborhood = content[0].trim();
        // cuisine = content[1].trim();

        // // Scrape the Review Count.
        // reviewCount = user.find('.reviews').text().trim();

        // // Scrape the list of available time slots.
        // slotsArray = [];
        // slots = user.find('.timeslots li');

        // // Note: Now that we've added time as a user preference, we may want to update peakStart and peakEnd dynamically.
        // // Currently, we're assuming that peak times are 4:59 to 10:01 and that time window calculations are only valid in this range.
        // peakStart = '16:59';
        // peakEnd = '22:01';
        // timeWindow = 0;

        // if (slots.length > 0) {
        //   // Parse time slots and push them into an array, marking unavailable slots.
        //   slots.each(function() {
        //     var slot = $(this);
        //     if (slot.find('a').length > 0) {
        //       slotsArray.push(slot.find('a').attr('href').split('&sd=')[1].split(' ')[1].substring(0,5));
        //     } else {
        //       slotsArray.push('unavailable');
        //     }
        //   })

        //   // Iterate through the slotsArray and track unavailable times.
        //   startTime = peakStart;
        //   slotsArray.forEach(function(slot, index) {

        //     // 1. For each slot in positions 0 to 3 check availability
        //     // 2. For each available slot, check the whether the previous slot was unavailable
        //     // 3. If the previous slot was unavailable, recognize an availability gap exists and add the time from the startTime up until the current slot
        //     // 4. Update the startTime so the next gap recorded does not overlap with the previous gaps (if any)
        //     if (index !== 4) {
        //       if (slot !== 'unavailable') {
        //         if (slotsArray[index - 1] == 'unavailable') {
        //           timeWindow = timeWindow + (parseTime(slot) - parseTime(startTime));
        //         }
        //         startTime = slot;
        //       }
        //     // 5. If the last slot is unavailable, calculate the gap from the last updated startTime to peakEnd.
        //     } else if (index == 4) {
        //       if (slot == 'unavailable') {
        //         timeWindow = timeWindow + (parseTime(peakEnd) - parseTime(startTime));
        //       }
        //     }

        //   })
        // } else {
        //   // If no slots are available, calculate the time window based on the difference between peakStart and peakEnd.
        //   timeWindow = parseTime(peakEnd) - parseTime(peakStart);
        // }

        // // Convert the timeWindow to HH:mm format.
        // hours = Math.floor(timeWindow / 60);
        // minutes = timeWindow %= 60;
        // timeWindow = hours + ':' + ('0' + minutes).slice(-2);


        // Save the data in CSV format.
        csv['data'] = csv['data'] + '"' + name + '","' + location + '","' + country + '","' + ig_name + '","' + ig_url + '",' + ig_status + '",' + ig_followers + '",' + email + '\r\n';

        // Save the data in JSON format.
        json[name] = {};
        json[name]['name'] = name;
        json[name]['location'] = location;
        json[name]['country'] = country;
        json[name]['igName'] = ig_name;
        json[name]['igUrl'] = ig_url;
        json[name]['igStatus'] = ig_status;
        json[name]['igFollowers'] = ig_followers;
        json[name]['email'] = email;

      });

      // Let async know we're done.
      callback(null);

    }
    else {
      callback(error);
    }

  });

}
