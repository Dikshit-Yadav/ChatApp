import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        isGroup: {
            type: Boolean,
            default: false,
        },
        members: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            // validate: {
            //     validator: (val) => val.length >= 2,
            //     message: "A conversation must have at least 2 members",
            // },
        },
        groupName: {
            type: String,
            default: "",
            required: function () { return this.isGroup; },
        },
        groupAvatar: {
            type: String,
            default: "",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: function () { return this.isGroup; },
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);