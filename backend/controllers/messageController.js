const Message = require('../models/messageModel');
const ImageMessage = require('../models/ImageMessageModel')

const getMessages = async (req, res) => {
    try {
        const from = req.user._id
        const to = req.query.to;
        const after = req.query.after;

        if (!to) {
            return res.status(400).json({ message: "The recipient is needed to fetch messages" });
        }

        const baseFilter = {
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        };

        let sinceDate = null;
        if (after) {
            const parsed = new Date(after);
            if (!Number.isNaN(parsed.getTime())) {
                sinceDate = parsed;
            }
        }

        const textFilter = sinceDate
            ? { ...baseFilter, timestamp: { $gt: sinceDate } }
            : baseFilter;

        const imageFilter = sinceDate
            ? { ...baseFilter, timestamp: { $gt: sinceDate } }
            : baseFilter;

        const textMessages = await Message.find(textFilter);

        const imageMessages = await ImageMessage.find(imageFilter);

        // Merge and sort by timestamp
        const messages = [...textMessages, ...imageMessages].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );


        res.json({ messages });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const sendMessage = async (req, res) => {
    try {
        const from = req.user._id
        const { to, text } = req.body;

        if (!to || !text) {
            return res.status(400).json({ message: "Recipient and text are required" });
        }

        const senderName = req.user.name || req.user.displayName || 'User';
        const message = new Message({ from, to, text, senderName });
        await message.save();

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const markMessagesAsRead = async (req, res) => {
    try {
        const to = req.user._id;
        const { from } = req.query;

        if (!from) {
            return res.status(400).json({ message: "Sender ID is required" });
        }

        // Mark all text messages from this sender as read
        const textUpdate = await Message.updateMany(
            { from, to, isRead: false },
            { isRead: true }
        );

        // Mark all image messages from this sender as read
        const imageUpdate = await ImageMessage.updateMany(
            { from, to, isRead: false },
            { isRead: true }
        );

        const totalUpdated = textUpdate.modifiedCount + imageUpdate.modifiedCount;
        res.json({ success: true, message: 'Messages marked as read', updated: totalUpdated });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const to = req.user._id;

        // Count unread text messages
        const textUnread = await Message.countDocuments({ to, isRead: false });

        // Count unread image messages
        const imageUnread = await ImageMessage.countDocuments({ to, isRead: false });

        const total = textUnread + imageUnread;
        res.json({ success: true, unreadCount: total, textUnread, imageUnread });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getUnreadByUser = async (req, res) => {
    try {
        const to = req.user._id;

        // Get unread messages grouped by sender
        const textUnread = await Message.aggregate([
            { $match: { to, isRead: false } },
            { $group: { _id: '$from', count: { $sum: 1 } } }
        ]);

        const imageUnread = await ImageMessage.aggregate([
            { $match: { to, isRead: false } },
            { $group: { _id: '$from', count: { $sum: 1 } } }
        ]);

        // Combine counts by user
        const unreadByUser = {};
        textUnread.forEach(u => {
            unreadByUser[u._id] = (unreadByUser[u._id] || 0) + u.count;
        });
        imageUnread.forEach(u => {
            unreadByUser[u._id] = (unreadByUser[u._id] || 0) + u.count;
        });

        res.json({ success: true, unreadByUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
    getUnreadByUser
};
