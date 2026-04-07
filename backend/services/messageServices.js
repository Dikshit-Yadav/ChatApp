import Message from "../models/Message.js";
import { updateLastMessage } from "./conversationService.js";

// create and store text message
export const createMessage = async (senderId, conversationId, text) => {
    if (!text?.trim()) throw new Error("Message text is required");

    const msg = await Message.create({
        senderId,
        conversationId,
        message: text.trim(),
    });

    await updateLastMessage(conversationId, msg._id);

    return msg;
};

// create and store file message
export const createFileMessage = async (senderId, conversationId, file) => {
    if (!file?.url) throw new Error("File is required");

    const msg = await Message.create({
        senderId,
        conversationId,
        file: {
            url: file.url,
            type: file.type,
            name: file.name,
            size: file.size,
        },
    });

    await updateLastMessage(conversationId, msg._id);

    return msg;
};

// fetch messages with page
export const getMessagesByConversation = async (conversationId, page = 1, limit = 30) => {
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "username profilePic");

    return messages;
};