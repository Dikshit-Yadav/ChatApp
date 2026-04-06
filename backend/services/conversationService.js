import Conversation from "../models/Conversation.js";

// create or get private chat
export const getOrCreatePrivateChat = async (userId, receiverId) => {
    let chat = await Conversation.findOne({
        members: { $all: [userId, receiverId] },
    });

    if (!chat) {
        chat = await Conversation.create({
            members: [userId, receiverId],
            isGroup: false,
        });
    }

    return chat;
};

// get all conversations
export const getUserConversations = async (userId) => {
    return await Conversation.find({ members: userId }).populate("members", "username email");
};

// delete a private conversation
export const deleteConversation = async (conversationId, userId) => {
    return await Conversation.findOneAndDelete({
        _id: conversationId,
        members: userId,
    });
};

// create a group
export const createGroup = async (userId, groupName, members) => {
    return await Conversation.create({
        members: [...members, userId],
        groupName,
        isGroup: true,
        admin: userId,
    });
};

// get group by ID
export const getGroupById = async (conversationId) => {
    return await Conversation.findById(conversationId).populate("members", "username email");
};

// update group name (admin only)
export const updateGroupName = async (conversationId, userId, groupName) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId },
        { groupName },
        { new: true }
    );
};

// delete group (admin only)
export const deleteGroup = async (conversationId, userId) => {
    return await Conversation.findOneAndDelete({ _id: conversationId, admin: userId });
};

// add member to group (admin only)
export const addMemberToGroup = async (conversationId, userId, memberId) => {
    return await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId },
        { $addToSet: { members: memberId } },
        { new: true }
    ).populate("members", "username email");
};