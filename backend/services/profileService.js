import User from "../models/User.js";
import { deleteCache, deleteCachePattern } from "./cacheService.js";

export const getUserById = async (userId) => {
    return await User.findById(userId);
};

export const updateUser = async (userId, data, file) => {
    const updateData = {
        username: data.username,
        email: data.email,
        phone: data.phone,
    };

    if (file) {
        const domain = "http://localhost:4500";
        updateData.profilePic = `${domain}/uploads/${file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
    });

    // Invalidate user cache after profile update
    await deleteCache(`user:${userId}`);

    return updatedUser;
};

export const updatePic = async (userId, file) => {
    const domain = "http://localhost:4500";
    const profilePic = `${domain}/uploads/${file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic },
        { new: true }
    );

    // Invalidate user cache after pic update
    await deleteCache(`user:${userId}`);

    return updatedUser;
};

export const deleteUser = async (userId) => {
    const deletedUser = await User.findByIdAndDelete(userId);

    // Invalidate user cache and all friends caches
    await deleteCache(`user:${userId}`);
    await deleteCachePattern(`friends:*`);

    return deletedUser;
};