const User = require('../models/userModel'); // Fix: Use User, not userModel

const getAllUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id; // Use MongoDB ObjectId for all users
        const users = await User.find({ _id: { $ne: currentUserId } }).select('googleId email name avatar status');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Query parameter is required" });
        }
        const q = query.trim();
        const currentGoogleId = req.user.googleId; // Fix: Use req.user.googleId
        const users = await User.find({
            name: { $regex: q, $options: 'i' }, // Fix: $options, not $opitons
            googleId: { $ne: currentGoogleId }
        }).select('googleId name avatar status');
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getAllUsers,
    searchUsers
};