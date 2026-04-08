import User from "../models/User.js";

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

    return await User.findByIdAndUpdate(userId, updateData, {
        new: true,
    });
};

export const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};