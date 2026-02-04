const passport = require('passport');
const User = require('../models/userModel')
const bcrypt = require('bcrypt')



exports.login = passport.authenticate('google',
    {
        scope:['profile','email']
    });


exports.callback = passport.authenticate('google',
    {
        failureRedirect: '/',
        successRedirect: '/chat.html'
    })


exports.getCurrentUser = (req,res) => 
    {
       if(!req.user)
        {
            return res.status(401).json({message:'Not Authenticated'});
        } 
        res.json(req.user)
    }

exports.loginLocal = async(req,res,next) => 
    {
        const { email,password } = req.body;
        if (!email || !password)
            {
                return res.status(400),json({message:"Email and password are required"});
            }
        
        try
        {
            const user = await User.findOne({email});
            if (!user || !user.password)
                {
                    return res.status(401).json({message: 'Invalid credentials'});
                }
            
            const match = await bcrypt.compare(password, user.password);
            if (!match)
                {
                    return res.status(401).json({message:'Invalid Credentials'});
                }
            
            req.login(user, (err) => 
                {
                    if (err) return next(err);
                    res.json({message: 'Login successful'});
                }
            )
        }
        catch (err)
            {
                res.status(500).json({message: "Login failed",error : err.message});
            }
    };







exports.register = async(req,res) =>
    {
        try
        {
            const {name,email,password} = req.body;
            if(!name || !email || !password)
            {
                return res.status(400).json({message:'All fields are required.'});
            }

            const hashed = await bcrypt.hash(password,2);

            const user = new User(
                {
                    name,
                    email,
                    password:hashed
                }
            );

            await user.save();

            //auto login
            req.login(user,(err) =>
                {
                    if (err)
                    {
                        return res.status(500).json({message:"Registration succeeded but login failed"});
                    }
                res.status(201).json({message:"registration successfull"})
                }
            );
        }
            catch(err)
            {
                res.status(500).json({message: "Registration failet",error: err.message});
            }
        };


