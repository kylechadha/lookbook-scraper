//
// Master JavaScript File
// -----------------------------------

// Normally we would create modules to match our component structure, but in the interest of time / simplicity we haven't here.
$(document).ready(function() {
  
  // Pull the current date and set the default time to be 7:30PM.
  var now = moment();
  now.hour(19);
  now.minute(30);

  // Configure the date and time picker -- increments of 30 and present forward only.
  $('#datetimepicker1').datetimepicker({
      defaultDate: now,
      minDate: now,
      minuteStepping: 30
  });

  // Set the CSS3 spinner to run on button click.
  $('.btn-scrape').on('click', function() {
    $('.btn-text').hide();
    $('.spinner').show();
  })

});
