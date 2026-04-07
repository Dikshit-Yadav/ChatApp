import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// create or get private chat
export const getOrCreatePrivateChat = async (userId, receiverId) => {
    let chat = await Conversation.findOne({
        isGroup: false,
        members: { $all: [userId, receiverId], $size: 2 },
    })
        .populate("members", "username profilePic")
        .populate("lastMessage");

    if (!chat) {
        chat = await Conversation.create({
            members: [userId, receiverId],
            isGroup: false,
        });
        chat = await Conversation.findById(chat._id)
            .populate("members", "username profilePic")
            .populate("lastMessage");
    }

    return chat;
};

// Get a conversation by its ID
export const getConversationById = async (conversationId) => {
    const conversation = await Conversation.findById(conversationId)
        .populate("members", "username profilePic")
        .populate("lastMessage");

    if (!conversation) throw new Error("Conversation not found");

    return conversation;
};

// get all conversations for a user
export const getUserConversations = async (userId) => {
    return await Conversation.find({ members: userId })
        .populate("members", "username profilePic")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });
};

// delete a private conversation & messages
export const deleteConversation = async (conversationId, userId) => {
    const chat = await Conversation.findOneAndDelete({
        _id: conversationId,
        members: userId,
        isGroup: false,
    });

    if (chat) {
        await Message.deleteMany({ conversationId: chat._id });
    }

    return chat;
};

// create a group
export const createGroup = async (userId, groupName, members) => {
    const group = await Conversation.create({
        members: [...members, userId],
        groupName,
        isGroup: true,
        admin: userId,
    });

    return await Conversation.findById(group._id)
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");
};

// get group by ID
export const getGroupById = async (conversationId) => {
    return await Conversation.findById(conversationId)
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic")
        .populate("lastMessage");
};

// update group name
export const updateGroupName = async (conversationId, userId, groupName) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { groupName },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");
};

// delete group and its messages 
export const deleteGroup = async (conversationId, userId) => {
    const group = await Conversation.findOneAndDelete({
        _id: conversationId,
        admin: userId,
        isGroup: true,
    });

    if (group) {
        await Message.deleteMany({ conversationId: group._id });
    }

    return group;
};

// add member to group
export const addMemberToGroup = async (conversationId, userId, memberId) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { $addToSet: { members: memberId } },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");
};

// remove member from group
export const removeMemberFromGroup = async (conversationId, userId, memberId) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { $pull: { members: memberId } },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");
};

export const updateLastMessage = async (conversationId, messageId) => {
    return await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: messageId },
        { new: true }
    );
};