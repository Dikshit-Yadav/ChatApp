import * as userService from "../services/profileService.js";

export const getProfile = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: err.message });
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(
            req.params.userId,
            req.body,
            req.file
        );

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const deletedUser = await userService.deleteUser(req.params.userId);

        res.json(deletedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
