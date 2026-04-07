import User from "../models/User.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/sendMail.js";

const otpStore = new Map();

// register
export const registerUser = async ({ username, email, phone, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
    });

    return newUser;
};

// login
export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid password");

    return user;
};

// send registration otp
export const sendOtpService = async (email) => {
    const user = await User.findOne({ email });
    if (user) throw new Error("User already exists");

    const existing = otpStore.get(email);
    if (existing && Date.now() < existing.expiresAt) {
        throw new Error("OTP already sent. Please wait before requesting again");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    console.log(otp)
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(
        email,
        "Your OTP Code",
        `<h2>Email Verification</h2><h1>${otp}</h1>`
    );

    return true;
};

// verify otp
export const verifyOtpService = async (email, otp) => {
    const record = otpStore.get(email);

    if (!record) throw new Error("No OTP found");

    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        throw new Error("OTP expired");
    }

    if (record.otp !== otp.toString()) {
        throw new Error("Invalid OTP");
    }

    otpStore.delete(email);
    return true;
};

// send forgot password otp
export const sendForgetOtpService = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No account found with this email");

    const existing = otpStore.get(email);
    if (existing && Date.now() < existing.expiresAt) {
        throw new Error("OTP already sent. Please wait before requesting again");
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail(
        email,
        "Forgot Password OTP",
        `<h2>Password Reset</h2><h1>${otp}</h1>`
    );

    return true;
};

// reset password
export const resetPasswordService = async (email, password) => {
    if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );

    if (!user) throw new Error("User not found");

    return true;
};