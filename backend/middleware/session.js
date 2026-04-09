import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60,
    }),
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    }
});

export default sessionMiddleware;