import * as invitationService from "../services/invitationServices.js";
import User from "../models/User.js";
import { getIO } from "../server.js";
import { getReceiverSocket } from "../socket/index.js";
// send invite
export const invite = async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const { receiverId } = req.body;

        const invite = await invitationService.sendInviteService(
            senderId,
            receiverId
        );

        const sender = await User.findById(senderId).select(
            "username email profilePic"
        );

        const receiverSocket = getReceiverSocket(receiverId);
        console.log("Receiver socket:", receiverSocket);

        if (receiverSocket) {
            const io = getIO();

            io.to(receiverSocket).emit("new-invite", {
                invite: {
                    _id: invite._id,
                    senderId: sender,
                },
                sender,
            });
        }

        res.json({ message: "Invitation sent", invite });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// respond
export const responseInvite = async (req, res) => {
    try {
        const { invitationId, status } = req.body;

        const invite = await invitationService.respondInviteService(
            invitationId,
            status
        );

        const senderId = invite.senderId._id.toString();
        const receiverSocket = getReceiverSocket(senderId);

        if (receiverSocket) {
            const io = getIO();
            io.to(receiverSocket).emit("invite-response", {
                status,
                receiverId: req.session.user.id,
            });
        }
        res.json({
            message: `Invitation ${status}`,
            invite,
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// get invites
export const getInvitations = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const invites = await invitationService.getInvitationsService(userId);

        res.json(invites);

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};