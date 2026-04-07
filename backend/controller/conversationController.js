import * as conversationService from "../services/conversationService.js";

// create or get private chat
export const conversation = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { receiverId } = req.body;

        const chat = await conversationService.getOrCreatePrivateChat(userId, receiverId);
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// get all conversations
export const getConversations = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const conversationId = req.query.conversationId;

        if (conversationId) {
            const conversation = await conversationService.getGroupById(conversationId);
            if (!conversation) return res.status(404).json({ message: "Conversation not found" });
            if (!conversation.members.includes(userId)) return res.status(403).json({ message: "Unauthorized" });
            return res.json(conversation);
        }
        const conversations = await conversationService.getUserConversations(userId);
        res.json({ message: "conversations found", conversations });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// delete private chat
export const deleteChat = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { conversationId } = req.params;

        const chat = await conversationService.deleteConversation(conversationId, userId);

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        res.json({ message: "Chat deleted successfully", chat });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// create group
export const createGroup = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { members, groupName } = req.body;

        const group = await conversationService.createGroup(userId, groupName, members);
        res.json({ message: "group created", group });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// get group
export const getGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const group = await conversationService.getGroupById(conversationId);
        res.json(group);
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// update group name
export const updateGroupName = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { groupName } = req.body;
        const userId = req.session.user.id;

        const group = await conversationService.updateGroupName(conversationId, userId, groupName);

        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "group name updated", group });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// delete group
export const deleteGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.user.id;

        const group = await conversationService.deleteGroup(conversationId, userId);

        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "group deleted", group });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};

// add member to group
export const addMember = async (req, res) => {
    try {
        const { conversationId, memberId } = req.body;
        const userId = req.session.user.id;

        const group = await conversationService.addMemberToGroup(conversationId, userId, memberId);

        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "Member added successfully", group });
    } catch (err) {
        res.status(500).json({ message: "server error" });
    }
};