import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: String,
  password: {
    type: String,
    required: function() { return !this.googleId; },
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  googleId: String,
  profilePic: String,

}, { timestamps: true });

export default mongoose.model("User", userSchema);