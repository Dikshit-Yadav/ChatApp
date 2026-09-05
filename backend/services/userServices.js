import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";
import { getCache, setCache, deleteCache } from "./cacheService.js";

//me — Redis cached
export const getUserById = async (userId) => {
    const cacheKey = `user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId).select("-password");

    if (user) {
        // Cache for 10 minutes
        await setCache(cacheKey, user, 600);
    }

    return user;
};


// search users — NOT cached (dynamic, low frequency)
export const searchUserService = async (search, userId) => {
    if (!search) throw new Error("Search query is required");

    if (search.trim().length < 2) {
        throw new Error("Search query must be at least 2 characters");
    }

    const users = await User.find({
        _id: { $ne: userId },
        $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ],
    }).select("username email profilePic phone");

    if (users.length === 0) return [];

    const invitations = await Invitation.find({
        senderId: userId,
        receiverId: { $in: users.map((u) => u._id) },
    });

    const inviteMap = {};
    invitations.forEach((inv) => {
        inviteMap[inv.receiverId.toString()] = inv.status;
    });

    return users.map((u) => ({
        ...u.toObject(),
        invitationStatus: inviteMap[u._id.toString()] || null,
    }));
};

// get friends — Redis cached
export const getFriendsService = async (userId) => {
    const cacheKey = `friends:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId).populate(
        "friends",
        "username email profilePic"
    );
    const objectId = new mongoose.Types.ObjectId(userId);
    const conversations = await Conversation.find({ members: objectId })
        .populate({
            path: "lastMessage",
            select: "message",
        })
        .select("_id members lastMessage");

    const formattedConversations = conversations.map(conv => ({
        conversationId: conv._id,
        members: conv.members.map(m => m.toString()),
        lastMessage: conv.lastMessage ? conv.lastMessage.message : null
    }));

    if (!user) throw new Error("User not found");

    const result = {
        friends: user.friends,
        conversations: formattedConversations
    };

    // Cache for 5 minutes
    await setCache(cacheKey, result, 300);

    return result;
};

// get suggestions — NOT cached (dynamic results)
export const getSuggestionsService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const pendingInvites = await Invitation.find({
        senderId: userId,
        status: "pending",
    });
    const pendingIds = pendingInvites.map((i) => i.receiverId);

    const excludeUsers = [...user.friends, userId, ...pendingIds];

    return await User.find({
        _id: { $nin: excludeUsers },
    })
        .select("username email profilePic")
        .limit(10);
};