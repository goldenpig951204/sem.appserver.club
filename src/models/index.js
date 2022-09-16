const mongoose = require('mongoose');

/**
 * Connect to mongo database to manage data
 */
const connect = async = () => {
    mongoose.connect(process.env.MONGO_URI, {
        logger: process.env.NODE_ENV === 'development',
        serverSelectionTimeoutMS: 5000,
        dbName: 'production'
    });
    /**
     * After connected to the database, Print a success message.
     */
    mongoose.connection.on('connected', () => {
        console.log(`Mongoose connected ==========>: ${process.env.MONGO_URI}`);
    })
}

module.exports = connect;