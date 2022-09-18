const mongoose = require('mongoose');
const { Schema } = mongoose;
/**
 * Define a schema to create a setting model.
 */
const SettingSchema = new Schema({
    membershipLids: [Number],
    membershipApiKey: String,
    domainOverviewLimit: {
        type: Number,
        default: 5,
    },
    keywordOverviewLimit: {
        type: Number,
        default: 5
    },
    userAgent: String,
    cookie: String
});
/**
 * Define the setting model.
 */
const Setting = mongoose.model('setting', SettingSchema);

module.exports = Setting;