import * as messageService from "../services/messageServices.js";
import * as fileService from "../services/fileServices.js";

// send message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const { conversationId, message } = req.body;

        const msg = await messageService.createMessage(senderId, conversationId, message);
        res.json(msg);
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// get all messages
export const getMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await messageService.getMessagesByConversation(conversationId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// send a file
export const sendFile = async (req, res) => {
    try {
        const fileUrl = fileService.processUploadedFile(req.file);
        res.json({ fileUrl });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};