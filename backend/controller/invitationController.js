import * as invitationService from "../services/invitationServices.js";
import User from "../models/User.js";
import { getIO } from "../server.js";
import { getReceiverSocket } from "../socket/index.js";

// send invite
export const invite = async (req, res) => {
    try {
        const senderId = req.session.user.id;
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({ message: "receiverId is required" });
        }

        const invite = await invitationService.sendInviteService(senderId, receiverId);

        const sender = await User.findById(senderId).select("username email profilePic");

        const receiverSocket = getReceiverSocket(receiverId);
        if (receiverSocket) {
            const io = getIO();
            io.to(receiverSocket).emit("new-invite", {
                invite: { _id: invite._id, senderId: sender },
                sender,
            });
        }

        res.json({ message: "Invitation sent" });

    } catch (err) {
        console.error(err);
        res.status(err.status || 400).json({ message: err.message });
    }
};

// respond to invite
export const responseInvite = async (req, res) => {
    try {
        const { invitationId, status } = req.body;
        const userId = req.session.user.id;

        if (!invitationId) {
            return res.status(400).json({ message: "invitationId is required" });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Status must be accepted or rejected" });
        }

        const invite = await invitationService.getInviteById(invitationId);
        if (!invite) return res.status(404).json({ message: "Invitation not found" });

        if (invite.receiverId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedInvite = await invitationService.respondInviteService(invitationId, status);

        const senderId = updatedInvite.senderId._id.toString();
        const receiverSocket = getReceiverSocket(senderId);
        if (receiverSocket) {
            const io = getIO();
            io.to(receiverSocket).emit("invite-response", {
                status,
                receiverId: userId,
            });
        }

        res.json({ message: `Invitation ${status}`, invite: updatedInvite });

    } catch (err) {
        console.error(err);
        res.status(err.status || 400).json({ message: err.message });
    }
};

// get pending invitations
export const getInvitations = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const invites = await invitationService.getInvitationsService(userId);
        res.json(invites);
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ message: err.message || "Server error" });
    }
};