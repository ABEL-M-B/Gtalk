require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authModel = require('../models/authModel');
const User = require('../models/userModel'); // Import the actual User model

passport.serializeUser((user, done) => {
    // Store only the MongoDB _id in the session
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        // Fetch the user by _id from MongoDB
        const user = await User.findById(id).lean();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await authModel.findByGoogleId(profile.id);

            if (user) {
                return done(null, user);
            }

            await authModel.createUser({
                google_id: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                avatar: profile.photos[0]?.value || ''
            });

            user = await authModel.findByGoogleId(profile.id);
            return done(null, user);

        } catch (err) {
            return done(err, null);
        }
    }
));

module.exports = passport;