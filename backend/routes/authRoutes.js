import express from "express";
import { register, authCheck, login, resetPass, logout, googleCallback, sendOtp, verifyOtp, sendForgetOtp} from "../controller/authController.js";
import passport from "passport";
import {
    registerValidation,
    loginValidation,
    sendOtpValidation,
    verifyOtpValidation,
    resetPasswordValidation
} from "../middleware/validator.js";

const router = express.Router();

router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"]
    })
);
router.get("/google/callback",
    passport.authenticate('google', { session: true, failureRedirect: `${process.env.CLIENT_URL}/login` }), googleCallback)
router.post("/register", registerValidation, register);
router.post("/send-otp", sendOtpValidation, sendOtp);
router.post("/send-otp/forgot", sendOtpValidation, sendForgetOtp);
router.post("/verify", verifyOtpValidation, verifyOtp);
router.post("/login", loginValidation, login);
router.patch("/reset-password", resetPasswordValidation, resetPass);
router.post("/logout", logout);
router.get("/check", authCheck);

export default router;