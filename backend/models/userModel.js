const pool = require('../config/db')

const getAllUsersExcept = async (googleId) => {
    const [rows] = await pool.query(
        'SELECT google_id, name, avatar, status FROM users WHERE google_id != ?',
        [googleId]
    );
    // Map DB fields to frontend-friendly names
    return rows.map(user => ({
        googleId: user.google_id,
        name: user.name,
        avatar: user.avatar,
        status: user.status
    }));
};

const searchUsers = async (query, currentGoogleId) => {
    const [rows] = await pool.query(
        'SELECT google_id, name, avatar, status FROM users WHERE (name LIKE ?) AND google_id != ?',
        [`%${query}%`, currentGoogleId]
    );
    return rows.map(user => ({
        googleId: user.google_id,
        name: user.name,
        avatar: user.avatar,
        status: user.status
    }));
};



module.exports = {
    getAllUsersExcept,
    searchUsers
};
