import * as authService from "../services/authServices.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// register
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required" });
        }

        const user = await authService.registerUser(req.body);

        req.session.user = { id: user._id, email: user.email };

        const { password: _, googleId, __v, ...safeUser } = user.toObject();
        res.status(201).json({ message: "User created", user: safeUser });

    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await authService.loginUser(req.body);

        req.session.user = { id: user._id, email: user.email };
        req.session.save();

        const { password: _, googleId, __v, ...safeUser } = user.toObject();
        res.json({ message: "Login successful", user: safeUser });

    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// send otp
export const sendOtp = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({ message: "Email is required" });
        }
        await authService.sendOtpService(req.body.email);
        res.json({ message: "OTP sent" });
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// send forget password otp
export const sendForgetOtp = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(400).json({ message: "Email is required" });
        }
        await authService.sendForgetOtpService(req.body.email);
        res.json({ message: "OTP sent" });
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// verify otp
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        await authService.verifyOtpService(email, otp);

        req.session.otpVerified = { email };

        res.json({ message: "OTP verified" });
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// reset password
export const resetPass = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if (!req.session.otpVerified || req.session.otpVerified.email !== email) {
            return res.status(403).json({ message: "OTP verification required before resetting password" });
        }

        await authService.resetPasswordService(email, password);

        delete req.session.otpVerified;

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(err.status || 400).json({ message: err.message });
    }
};

// logout
export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
    });
};



export const authCheck = (req, res) => {
  if (req.session.user) {
    // console.log(req.session.user)
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.status(401).json({ authenticated: false });
};

// google callback
export const googleCallback = (req, res) => {
    try {
        // console.log(req.user)
        if (!req.user) {
            return res.redirect(`${CLIENT_URL}/login`);
        }

        req.session.user = {
            id: req.user._id,
            email: req.user.email,
        };
        
        req.session.save(() => {
            res.redirect(`${CLIENT_URL}/chat`);
        });
    } catch (error) {
        res.redirect(`${CLIENT_URL}/login?error=oauth_failed`);
    }
};