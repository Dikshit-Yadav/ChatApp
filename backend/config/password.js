import passport from "passport";
import dotenv from "dotenv";
import { Strategy as googleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
dotenv.config();
passport.use(new googleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4500/auth/google/callback"
    },

    async (accessToken, refreshToken, profile, cb) => {
        console.log(profile)
        try {
            const email = profile.emails[0].value;
            let user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    username: profile.displayName,
                    profilePic: profile.photos[0].value,
                    email,
                    googleId: profile.id
                });
            }
            return cb(null, user)
        } catch (err) {
            cb(err, null)
        }
    }
));

passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

passport.deserializeUser(async (id, cb) => {
    const user = await User.findById(id)
    cb(null, user)
})

export default passport;