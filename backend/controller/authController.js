import User from "../models/User.js";
import bcrypt from "bcrypt";


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
        if(!user) return res.status(400).json({ msg: "User not found" });
        res.redirect("http://localhost:5173/reset-password");
    }catch(err){
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