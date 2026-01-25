const userModel = require('../models/userModel');

const getAllUsers = async (req,res) =>
    {
        try
        {
            //console.log('Session', req.session)
            const currentGoogleId = req.session.passport.user;
            const users = await userModel.getAllUsersExcept(currentGoogleId);
            res.json({users});
        }
        catch(err)
        {
            res.status(500).json({message: 'Server error',error: err.message})
        }
    }

const searchUsers = async(req,res) =>
    {
        try
        {
            const query = req.query.q;
            if(!query)
            {
                return res.status(400).json({message: "Query parameter is required"});
            }
            const q = query.trim()
            const currentGoogleId = req.session.passport.user;
            const users = await(userModel.searchUsers(q,currentGoogleId))
            res.json({users});
        }
        catch (err)
        {
            res.status(500).json({message: 'Server error',error:err.message});
        }
    };


module.exports = {
    getAllUsers,
    searchUsers
};
