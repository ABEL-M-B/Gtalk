const Message = require('../models/messageModel');
const ImageMessage = require('../models/ImageMessageModel')

const getMessages = async (req, res) => {
    try {
        const from = req.user._id
        const to = req.query.to;

        if (!to) {
            return res.status(400).json({ message: "The recipient is needed to fetch messages" });
        }

        const textMessages = await Message.find({
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        });

        const imageMessages = await ImageMessage.find({
            $or: [
                { from, to },
                { from: to, to: from }
            ]
        });

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

        const message = new Message({ from, to, text }); // Remove manual timestamp; schema has default
        await message.save();

        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getMessages,
    sendMessage
};