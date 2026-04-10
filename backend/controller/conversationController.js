import * as conversationService from "../services/conversationService.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../server.js";
import { getReceiverSockets } from "../socket/index.js";

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
    const userId = req.session.user.id;
    const { groupId, newMemberId } = req.body;

    const group = await Conversation.findById(groupId)
      .populate("members", "username profilePic");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 🔒 only members can add
    if (!group.members.some(m => m._id.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🚫 prevent duplicate
    if (group.members.some(m => m._id.toString() === newMemberId)) {
      return res.status(400).json({ message: "Already in group" });
    }

    group.members.push(newMemberId);
    await group.save();

    const updatedGroup = await Conversation.findById(groupId)
      .populate("members", "username profilePic");

    // ⚡ SOCKET
    const io = getIO();
    const sockets = getReceiverSockets(newMemberId);

    sockets.forEach((socketId) => {
      io.to(socketId).emit("added-to-group", {
        group: updatedGroup,
      });
    });

    res.json({ message: "Member added", group: updatedGroup });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.body;

    const group = await Conversation.findById(groupId);

    group.members = group.members.filter(
      (m) => m.toString() !== memberId
    );

    await group.save();

    res.json({ message: "Member removed", group });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};