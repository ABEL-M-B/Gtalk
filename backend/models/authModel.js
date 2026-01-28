// filepath: backend/models/authModel.js
const pool = require('../config/db');
const User = require('./userModel')

const findByGoogleId = async (googleId) => {
    return await User.findOne({googleId})
};

const createUser = async ({ google_id, email, name, avatar }) => {
    const user = new User({
        googleId: google_id,
        name,
        avatar,
        // You can add email and other fields to the schema if needed
    });
    await user.save();
    return user;
};
    

module.exports = {
    findByGoogleId,
    createUser
};
