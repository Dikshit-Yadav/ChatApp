import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        phone: {
            type: String,
            default: "",
        },
        password: {
            type: String,
            required: function () { return !this.googleId; },
            select: false,
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        googleId: {
            type: String,
            index: true,
        },
        profilePic: {
            type: String,
            default: "http://localhost:4500/uploads/1775564452190-Screenshot 2026-04-07 172503.png"
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);