const mongoose = require('mongoose')
const messagesConnection = require('../config/mongodb_messages')();

const messageSchema = new mongoose.Schema(
    {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: {type:String,required:true},
        timestamp :{type:Date,default:Date.now}
    }
);

const Message = messagesConnection.model('Message', messageSchema, 'message');

module.exports = Message;