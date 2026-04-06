import User from "../models/User.js";
import Invitation from "../models/Invitation.js";

// search users
export const searchUserService = async (search, userId) => {
  if (!search) throw new Error("Search query is required");

  const users = await User.find({
    $or: [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ],
  }).select("-password");

  const usersWithStatus = await Promise.all(
    users.map(async (u) => {
      const invitation = await Invitation.findOne({
        senderId: userId,
        receiverId: u._id,
      });

      return {
        ...u.toObject(),
        invitationStatus: invitation ? invitation.status : null,
      };
    })
  );

  return usersWithStatus;
};

// get friends
export const getFriendsService = async (userId) => {
  const user = await User.findById(userId).populate(
    "friends",
    "username email profilePic"
  );

  if (!user) throw new Error("User not found");

  return user.friends;
};