const Message = require('../models/messageModel')

const getMessages = async(req,res) => 
    {
        try{
        const from = req.session.passport.user;
        const to = req.query.to;

        if(!to)
            {
                return res.status(400).json({message:"the receipient is needed to send the message"})
            }
        
        const messages = await Message.find(
            {
                $or: [
                        {from,to},
                        {from:to,to:from}
                        ]
            }
        ).sort({timestamp:1})

        res .json({messages})

        }catch(err){
            res.status(500).json({message:'Server error',error:err.message});
        }
    };


const sendMessage = async(req,res) =>
    {
        try{
        const from = req.session.passport.user;
        const {to,text} = req.body;

        if (!to || !text){
            return res.status(400).json({message:"Recipent"})
        }

        const message = new Message({from,to,text,timestamp : new Date()})//
        await message.save();

        res.json ({success: true , message});
        
        }catch(err)
            {
                res.status(500).json({message: 'Server error',error: err.message});
            }

    }


module.exports = {
    getMessages,
    sendMessage
}
