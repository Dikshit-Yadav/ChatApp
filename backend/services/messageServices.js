import Message from "../models/Message.js";
import { updateLastMessage } from "./conversationService.js";
import { getCache, setCache, deleteCachePattern } from "./cacheService.js";

// create and store text message
export const createMessage = async (senderId, conversationId, text) => {
    if (!text?.trim()) throw new Error("Message text is required");

    const msg = await Message.create({
        senderId,
        conversationId,
        message: text.trim(),
    });

    await updateLastMessage(conversationId, msg._id);

    // Invalidate message cache for this conversation (all pages)
    await deleteCachePattern(`messages:${conversationId}:*`);

    return msg;
};

// create and store file message
export const createFileMessage = async (senderId, conversationId, files, text = "") => {
    const fileList = Array.isArray(files) ? files : (files ? [files] : []);
    if (fileList.length === 0) throw new Error("At least one file is required");

    const primaryFile = fileList[0];

    const msg = await Message.create({
        senderId,
        conversationId,
        message: text ? text.trim() : "",
        file: primaryFile,
        files: fileList,
    });

    await msg.populate("senderId", "username profilePic");
    await updateLastMessage(conversationId, msg._id);

    // Invalidate message cache for this conversation (all pages)
    await deleteCachePattern(`messages:${conversationId}:*`);

    return msg;
};

// fetch messages with pagination — Redis cached
export const getMessagesByConversation = async (conversationId, userId, page = 1, limit = 30) => {
    const cacheKey = `messages:${conversationId}:page:${page}:limit:${limit}`;

    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        // Filter out messages deleted for this user from cached results
        return cached.filter(
            (msg) => !msg.deletedFor || !msg.deletedFor.includes(userId)
        );
    }

    const skip = (page - 1) * limit;

    const messages = await Message.find({
        conversationId,
        deletedFor: { $ne: userId }
    })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "username profilePic");

    // Cache the result for 5 minutes
    await setCache(cacheKey, messages, 300);

    return messages;
};

// delete message for everyone - permanent delete
export const deleteMessageForEveryone = async (messageId, userId) => {
    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    // only the sender can delete 
    if (message.senderId.toString() !== userId.toString()) {
        throw new Error("Unauthorized: Only sender can delete for everyone");
    }

    const conversationId = message.conversationId.toString();
    await Message.findByIdAndDelete(messageId);

    // Invalidate message cache for this conversation
    await deleteCachePattern(`messages:${conversationId}:*`);

    return message;
};

// delete message for me
export const deleteMessageForMe = async (messageId, userId) => {
    const message = await Message.findById(messageId);
    if (!message) throw new Error("Message not found");

    const conversationId = message.conversationId.toString();

    const updated = await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: userId }
    }, { new: true });

    // Invalidate message cache for this conversation
    await deleteCachePattern(`messages:${conversationId}:*`);

    return updated;
};