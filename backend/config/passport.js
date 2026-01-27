require('dotenv').config()
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authModel = require('../models/authModel');


passport.serializeUser((user, done) => {
    done(null, user.google_id);
});



passport.deserializeUser(async (google_id, done) => {
    try {
        const user = await authModel.findByGoogleId(google_id);
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
    async (accessToken, refreshToken,profile,done) =>

        {
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
