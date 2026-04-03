import User from "../models/User.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendMail.js";


export const register = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, phone, password: hashedPassword });
        req.session.user = {
            id: newUser._id,
            email: newUser.email,
        };
        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const otpStore = new Map();


export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const otp = Math.floor(100000 + Math.random() * 900000);

        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });

        await sendEmail(
            email,
            "Your OTP Code",
            `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `
        );

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ message: "No OTP found. Please request OTP again." });
        }

        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (record.otp.toString() !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        otpStore.delete(email);

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid password" });
        req.session.user = {
            id: user._id,
            email: user.email,
        };
        res.status(200).json({ message: "Login successful", user: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });
        res.redirect("http://localhost:5173/reset-password");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(req.session.user.id, { password: hashedPassword });
        res.redirect("http://localhost:5173/login");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleCallback = (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("http://localhost:5173/login");
        }

        req.session.user = {
            id: req.user._id,
            email: req.user.email,
        };

        res.redirect("http://localhost:5173");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};