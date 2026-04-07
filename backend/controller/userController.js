import * as userService from "../services/userServices.js";

// search users
export const searchUser = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.session.user.id;

    const users = await userService.searchUserService(search, userId);

    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const friends = await userService.getFriendsService(userId);

    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//suggestion friends
export const getSuggestions = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const suggestions = await userService.getSuggestionsService(userId);

    res.status(200).json(suggestions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};