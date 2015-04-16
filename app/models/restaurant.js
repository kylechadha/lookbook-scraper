var mongoose = require('mongoose');

//
// Restaurant Model (unused)
// -----------------------------------


// Schema
// ----------------------------------------------
var restaurantSchema = mongoose.Schema({

  name : String

});

// Exports
// ----------------------------------------------
module.exports = mongoose.model('Restaurant', restaurantSchema);
