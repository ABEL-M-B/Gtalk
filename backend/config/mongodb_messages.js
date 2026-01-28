const mongoose = require('mongoose');
const MONGO_URI_MESSAGES = process.env.MONGO_URI_MESSAGES
let connection;

module.exports = () => {
    if (!connection) {
        try {
            connection = mongoose.createConnection(MONGO_URI_MESSAGES, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            connection.on('connected', () => {
                console.log('MongoDB (messages) connected');
            });
            connection.on('error', (err) => {
                console.error('MongoDB (messages) connection error', err);
            });
        } catch (err) {
            console.error('MongoDB (messages) connection setup failed:', err);
            process.exit(1);
        }
    }
    return connection;
};