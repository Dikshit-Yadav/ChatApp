import Message from "../models/Message.js";

// create and store message
export const createMessage = async (senderId, conversationId, message) => {
    return await Message.create({ senderId, conversationId, message });
};

// fetch messages
export const getMessagesByConversation = async (conversationId) => {
    const messages = await Message.find({ conversationId });
    return messages.sort((a, b) => a.createdAt - b.createdAt); 
};