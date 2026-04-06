import { getReceiverSocket } from "./index.js";
import * as invitationService from "../services/invitationService.js";


export const inviteFriend = async (req, res) => {
  try {
    const senderId = req.session.user.id;
    const { receiverId } = req.body;

    const invite = await invitationService.sendInviteService(
      senderId,
      receiverId
    );

    const receiverSocket = getReceiverSocket(receiverId);

    if (receiverSocket) {
      req.io.to(receiverSocket).emit("new-invite", {
        message: "New friend request",
      });
    }

    res.json({ message: "Invitation sent", invite });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};