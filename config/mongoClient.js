require('dotenv').config();
const { MongoClient } = require('mongodb');
const { Client } = require('ssh2');

async function createMongoClient() {
    const sshConfig = {
        host: process.env.SSH_HOST, // Your SSH host
        port: parseInt(process.env.SSH_PORT, 10), // Your SSH port
        username: process.env.SSH_USER, // Your SSH username
        password: process.env.SSH_PASSWORD,   // Your SSH password
        readyTimeout: 30000 
    };

    const mongoConfig = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    return new Promise((resolve, reject) => {
        const sshClient = new Client();
        
        sshClient
            .on('ready', () => {
                console.log('SSH Connection established');
                
                // Forwarding traffic to the MongoDB host
                sshClient.forwardOut(
                    '127.0.0.1', 
                    0, 
                    process.env.MONGO_URI.split('@')[1].split('/')[0], // Extract host from MONGO_URI
                    27017, 
                    (err, stream) => {
                        if (err) {
                            console.error('Error setting up SSH tunnel:', err);
                            sshClient.end();
                            return reject(err);
                        }

                        // MongoDB Client with SSH stream
                        const mongoClient = new MongoClient(process.env.MONGO_URI, {
                            ...mongoConfig,
                            stream: stream // Use SSH stream for MongoDB connection
                        });

                        mongoClient.connect()
                            .then(client => {
                                console.log('MongoDB client connected successfully');
                                resolve(client);
                            })
                            .catch(err => {
                                console.error('Error connecting to MongoDB:', err);
                                sshClient.end();
                                reject(err);
                            });
                    }
                );
            })
            .connect(sshConfig);

        sshClient.on('error', (err) => {
            console.error('SSH Connection error:', err);
            reject(err);
        });
    });
}

module.exports = createMongoClient;
