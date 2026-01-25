require('dotenv').config()
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI

const connectMongo = async() =>
{
    try
    {
        await mongoose.connect(MONGO_URI)
        console.log('MongoDB connected')
        
    }
    catch(err)
    {
        console.error('MongoDB connection error',err);
        process.exit(1)
    }
}



module.exports = connectMongo;