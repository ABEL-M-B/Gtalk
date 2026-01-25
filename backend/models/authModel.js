// filepath: backend/models/authModel.js
const pool = require('../config/db');

const findByGoogleId = async (googleId) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0];
};

const createUser = async ({ google_id, email, name, avatar }) => {
    
    const [result] = await pool.query(
        'INSERT INTO users (google_id, email, name, avatar, last_login) VALUES (?, ?, ?, ?, NOW())',
        [google_id, email, name, avatar]
    );
    return result.insertId;
};

module.exports = {
    findByGoogleId,
    createUser
};
