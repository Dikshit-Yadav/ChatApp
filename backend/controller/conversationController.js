import * as conversationService from "../services/conversationService.js";

export const createOrGetPrivateChat = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { receiverId } = req.body;

        if (!receiverId) return res.status(400).json({ message: "receiverId is required" });
        if (userId === receiverId) return res.status(400).json({ message: "Cannot chat with yourself" });

        const chat = await conversationService.getOrCreatePrivateChat(userId, receiverId);
        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// get single conversation by id
export const getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const chat = await conversationService.getConversationById(conversationId);
        if (!chat) return res.status(404).json({ message: "Conversation not found" });
        res.json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const conversationId = req.query.conversationId;

        if (conversationId) {
            const conversation = await conversationService.getGroupById(conversationId);
            if (!conversation) return res.status(404).json({ message: "Conversation not found" });

            const isMember = conversation.members.some(
                (m) => m._id.toString() === userId.toString()
            );
            if (!isMember) return res.status(403).json({ message: "Unauthorized" });

            return res.json(conversation);
        }

        const conversations = await conversationService.getUserConversations(userId);
        res.json({ message: "conversations found", conversations });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { conversationId } = req.params;

        const chat = await conversationService.deleteConversation(conversationId, userId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        res.json({ message: "Chat deleted successfully", chat });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const createGroup = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { members, groupName } = req.body;

        const group = await conversationService.createGroup(userId, groupName, members);
        res.json({ message: "group created", group });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const getGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const group = await conversationService.getGroupById(conversationId);
        res.json(group);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const updateGroupName = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { groupName } = req.body;
        const userId = req.session.user.id;

        const group = await conversationService.updateGroupName(conversationId, userId, groupName);
        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "group name updated", group });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.user.id;

        const group = await conversationService.deleteGroup(conversationId, userId);
        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "group deleted", group });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { memberId } = req.body;
        const userId = req.session.user.id;

        const group = await conversationService.addMemberToGroup(conversationId, userId, memberId);
        if (!group) return res.status(403).json({ message: "Unauthorized or group not found" });

        res.json({ message: "Member added successfully", group });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};