import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    message: {
        type: String,
    },
    file: {
        type: String,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent",
    },
},
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);