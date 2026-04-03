import express from "express";
import { register, login, forgetPassword, resetPassword, logout, googleCallback } from "../controller/authController.js";
import passport from "passport";


const router = express.Router();

router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);
router.get("/google/callback",
    passport.authenticate('google', { session: false }), googleCallback)
router.post("/register", register);
router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);

export default router;