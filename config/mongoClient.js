
require('dotenv').config();
const { MongoClient } = require('mongodb');

async function createMongoClient() {
    // MongoDB connection configuration for local database
    const mongoConfig = {
    };

    // MongoDB URI for local connection
    const mongoUri = process.env.MONGO_URI ; 

    try {
        const mongoClient = new MongoClient(mongoUri, mongoConfig);
        await mongoClient.connect(); // Connect to MongoDB directly

        console.log('MongoDB client connected successfully');
        return mongoClient; // Return the connected client
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err; // Rethrow the error
    }
}

module.exports = createMongoClient;
