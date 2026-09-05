import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "../config/redisClient.js";
import dotenv from "dotenv";

dotenv.config();

const sessionMiddleware = session({
    store: new RedisStore({
        client: redisClient,
        prefix: "sess:",
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
    }
});

export default sessionMiddleware;