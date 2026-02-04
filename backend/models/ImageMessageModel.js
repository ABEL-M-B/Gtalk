const mongoose = require ('mongoose')
const messagesConnection = require('../config/mongodb_messages')();

const imageMessageSchema = new mongoose.Schema(
    {
        from:{type:mongoose.Schema.Types.ObjectId,ref: 'User',required:true},
        to: { type: mongoose.Schema.Types.ObjectId,ref: 'User', required: true},
        url: {type: String, required: true},
        public_id: {type:String,required: true},
        timestamp: {type:Date,default: Date.now}
    }
);

module.exports = messagesConnection.model('ImageMessage',imageMessageSchema)