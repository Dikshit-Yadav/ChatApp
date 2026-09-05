import * as messageService from "../services/messageServices.js";
import * as fileService from "../services/fileServices.js";
import Message from "../models/Message.js";
import * as conversationService from "../services/conversationService.js";
import { getReceiverSockets } from "../socket/index.js";
import { getIO } from "../server.js";

// send text message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const { conversationId } = req.params;
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const conversation = await conversationService.getGroupById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const isMember = conversation.members.some(
            (m) => m._id.toString() === senderId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const msg = await messageService.createMessage(senderId, conversationId, text);

        const io = getIO();
        conversation.members.forEach((member) => {
            if (member._id.toString() !== senderId.toString()) {
                const receiverSocket = getReceiverSockets(member._id.toString());
                if (receiverSocket) {
                    io.to(receiverSocket).emit("new-message", msg);
                }
            }
        });

        res.json(msg);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

// get all messages in a conversation
export const getMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.user.id;
        const { page = 1, limit = 30 } = req.query;

        const conversation = await conversationService.getGroupById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const isMember = conversation.members.some(
            (m) => m._id.toString() === userId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const messages = await messageService.getMessagesByConversation(
            conversationId,
            userId,
            Number(page),
            Number(limit)
        );
        const messageArray = Array.isArray(messages) ? messages : messages.docs || [];
        // console.log(messageArray)
        res.json(messageArray);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const sendFile = async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const conversationId = req.params.conversationId || req.body.conversationId;
        const text = req.body.text || req.body.message || "";

        const uploadedFiles = req.files || (req.file ? [req.file] : []);
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const conversation = await conversationService.getGroupById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const isMember = conversation.members.some(
            (m) => m._id.toString() === senderId.toString()
        );
        if (!isMember) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const processedFiles = fileService.processUploadedFiles(uploadedFiles);
        const msg = await messageService.createFileMessage(senderId, conversationId, processedFiles, text);

        const io = getIO();
        io.to(conversationId).emit("receive-message", msg);

        conversation.members.forEach((member) => {
            if (member._id.toString() !== senderId.toString()) {
                const receiverSocket = getReceiverSockets(member._id.toString());
                if (receiverSocket) {
                    io.to(receiverSocket).emit("new-message", msg);
                }
            }
        });

        res.json(msg);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

// reaction
export const toggleReaction = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.session.user.id;

        if (!emoji) {
            return res.status(400).json({ error: "Emoji is required" });
        }

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        const existReaction = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
        );

        if (existReaction !== -1) {
            if (message.reactions[existReaction].emoji === emoji) {
                message.reactions.splice(existReaction, 1);
            } else {
                message.reactions[existReaction].emoji = emoji;
            }
        } else {
            message.reactions.push({ userId, emoji });
        }

        await message.save();
        await message.populate([
            { path: "reactions.userId", select: "username profilePic" },
            { path: "senderId", select: "username profilePic" }
        ]);

        const io = getIO();
        const conversation = await conversationService.getGroupById(message.conversationId);
        if (conversation) {
            conversation.members.forEach((member) => {
                if (member._id.toString() !== userId.toString()) {
                    const receiverSocket = getReceiverSockets(member._id.toString());
                    if (receiverSocket) {
                        io.to(receiverSocket).emit("message-reaction-updated", message);
                    }
                }
            });
        }

        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};

// delete message for everyone
export const deleteMessageForEveryone = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { id: messageId } = req.params;

        const msg = await Message.findById(messageId);
        if (!msg) return res.status(404).json({ message: "Message not found" });

        const conversationId = msg.conversationId.toString();

        await messageService.deleteMessageForEveryone(messageId, userId);

        const io = getIO();
        io.to(conversationId).emit("message-deleted-everyone", { messageId });

        res.json({ message: "Message deleted for everyone" });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

// delete message for me
export const deleteMessageForMe = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { id: messageId } = req.params;

        await messageService.deleteMessageForMe(messageId, userId);

        res.json({ message: "Message deleted for you" });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};