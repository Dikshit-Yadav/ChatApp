import * as userService from "../services/userServices.js";



//me 
export const getMe = async (req, res) => {
    try {
        const user = await userService.getUserById(req.session.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};


// search users
export const searchUser = async (req, res) => {
    try {
        const { search } = req.query;
        const userId = req.session.user.id;

        const users = await userService.searchUserService(search, userId);
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(error.status || 400).json({ message: error.message });
    }
};

// get friends
export const getFriends = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const friends = await userService.getFriendsService(userId);
        res.status(200).json(friends);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || "Server error" });
    }
};

// get friend suggestions
export const getSuggestions = async (req, res) => {
    try {
        const userId = req.session.user.id;
       
        const suggestions = await userService.getSuggestionsService(userId);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || "Server error" });
    }
};