const cloudinary = require('../config/cloudinary')
const ImageMessage = require('../models/ImageMessageModel')

const uploadImageMessage = async (req,res) =>
    {
        try
        {
            if (!req.file){
                return res.status(400).json({message:'No file found for upload'});
            }
            // make sure that we get the to 
            const {to} = req.body;
            const from = req.user._id
            
            if(!to){
                return res.status(400).json({message: 'Recepient is needed'})
            }


            const stream = cloudinary.uploader.upload_stream(
                {folder: 'gtalk_uploads'},
                async (error, result) => {
                    if (error){
                        return res.status(500).json({message: 'Cloudinary upload failed',error:error.message});
                    }

                    const imageMessage = new ImageMessage(
                        {
                            from,
                            to,
                            url: result.secure_url,
                            public_id: result.public_id

                        }
                    );
                    await imageMessage.save();
                    res.json({success: true,imageMessage});
                });
                //ending the stream 
                stream.end(req.file.buffer);
        }catch(err)
        {
            res.status(500).json({message: 'Upload failed',error: err.message});
        }
    };

module.exports = {uploadImageMessage};