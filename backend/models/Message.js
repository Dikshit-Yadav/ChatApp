import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            trim: true,
        },
        file: {
            url: { type: String },
            type: { type: String, enum: ["image", "video", "audio", "document"] },
            name: { type: String },
            size: { type: Number },
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "seen"],
            default: "sent",
        },
        deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        deletedForEveryone: { type: Boolean, default: false },
    },
    { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);