const mongoose = require('mongoose');
const { Schema } = mongoose;
/**
 * Define a schema to create the site model.
 */
const SiteSchema = Schema({
    url: {
        type: String,
        unique: true
    },
    membershipApiKey: {
        type: String,
        required: true
    }
});
/**
 * Define the site model.
 */
const Site = mongoose.model('site', SiteSchema);

module.exports = Site;