// config/db.js
const mongoose = require('mongoose');
const createMongoClient = require('./mongoClient'); // Adjust the path if necessary
require('dotenv').config();

let isConnected = false; // Track connection status

async function connectToDatabase() {
    try {
        const mongoClient = await createMongoClient(); // Create the MongoDB client
        // Store the connected client or perform further operations here if needed

        console.log('Connected to MongoDB!');
        return mongoClient; // Return the connected client
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error; // Rethrow the error for handling in higher-level code
    }
}




module.exports = connectToDatabase;
