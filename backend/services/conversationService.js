import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "./cacheService.js";

// helper: invalidate conversation caches for all members
const invalidateConversationCaches = async (conversation) => {
    if (!conversation) return;

    const convId = conversation._id?.toString() || conversation.toString();
    await deleteCache(`conversation:${convId}`);

    // If we have the full conversation object with members, invalidate their lists
    if (conversation.members && Array.isArray(conversation.members)) {
        const promises = conversation.members.map((member) => {
            const memberId = member._id?.toString() || member.toString();
            return deleteCache(`user-conversations:${memberId}`);
        });
        await Promise.all(promises);
    }
};

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

        // Invalidate conversation lists for both users
        await deleteCache(`user-conversations:${userId}`);
        await deleteCache(`user-conversations:${receiverId}`);
    }

    return chat;
};

// Get a conversation by its ID — Redis cached
export const getConversationById = async (conversationId) => {
    const cacheKey = `conversation:${conversationId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const conversation = await Conversation.findById(conversationId)
        .populate("members", "username profilePic")
        .populate("lastMessage");

    if (!conversation) throw new Error("Conversation not found");

    // Cache for 5 minutes
    await setCache(cacheKey, conversation, 300);

    return conversation;
};

// get all conversations for a user — Redis cached
export const getUserConversations = async (userId) => {
    const cacheKey = `user-conversations:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const conversations = await Conversation.find({ members: userId })
        .populate("members", "username profilePic")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

    // Cache for 3 minutes
    await setCache(cacheKey, conversations, 180);

    return conversations;
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
        await invalidateConversationCaches(chat);
        await deleteCachePattern(`messages:${conversationId}:*`);
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

    const populated = await Conversation.findById(group._id)
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");

    // Invalidate conversation lists for all members
    const allMembers = [...members, userId];
    await Promise.all(
        allMembers.map((memberId) => deleteCache(`user-conversations:${memberId}`))
    );

    return populated;
};

// get group by ID — Redis cached
export const getGroupById = async (conversationId) => {
    const cacheKey = `conversation:${conversationId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const group = await Conversation.findById(conversationId)
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic")
        .populate("lastMessage");

    if (group) {
        // Cache for 5 minutes
        await setCache(cacheKey, group, 300);
    }

    return group;
};

// update group name
export const updateGroupName = async (conversationId, userId, groupName) => {
    const group = await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { groupName },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");

    if (group) {
        await invalidateConversationCaches(group);
    }

    return group;
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
        await invalidateConversationCaches(group);
        await deleteCachePattern(`messages:${conversationId}:*`);
    }

    return group;
};

// add member to group
export const addMemberToGroup = async (conversationId, userId, memberId) => {
    const group = await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { $addToSet: { members: memberId } },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");

    if (group) {
        await invalidateConversationCaches(group);
        // Also invalidate for the newly added member
        await deleteCache(`user-conversations:${memberId}`);
    }

    return group;
};

// remove member from group
export const removeMemberFromGroup = async (conversationId, userId, memberId) => {
    const group = await Conversation.findOneAndUpdate(
        { _id: conversationId, admin: userId, isGroup: true },
        { $pull: { members: memberId } },
        { new: true }
    )
        .populate("members", "username profilePic")
        .populate("admin", "username profilePic");

    if (group) {
        await invalidateConversationCaches(group);
        // Also invalidate for the removed member
        await deleteCache(`user-conversations:${memberId}`);
    }

    return group;
};

export const updateLastMessage = async (conversationId, messageId) => {
    const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: messageId },
        { new: true }
    );

    // Invalidate the conversation cache and all members' conversation lists
    await deleteCache(`conversation:${conversationId}`);
    if (updated) {
        await invalidateConversationCaches(updated);
    }

    return updated;
};