import * as messageService from "../services/messageServices.js";
import * as fileService from "../services/fileServices.js";
import * as conversationService from "../services/conversationService.js";
import { getIO } from "../server.js";
import { getReceiverSocket } from "../socket/index.js";

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
                const receiverSocket = getReceiverSocket(member._id.toString());
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

    // send a file message
    export const sendFile = async (req, res) => {
        try {
            const senderId = req.session.user.id;
            const { conversationId } = req.params;

            if (!req.file) {
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

            const file = fileService.processUploadedFile(req.file);
            const msg = await messageService.createFileMessage(senderId, conversationId, file);

            const io = getIO();
            conversation.members.forEach((member) => {
                if (member._id.toString() !== senderId.toString()) {
                    const receiverSocket = getReceiverSocket(member._id.toString());
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