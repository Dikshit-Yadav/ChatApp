import express from "express";
import {invite, responseInvite, getInvitations} from "../controller/invitationController.js"
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { inviteValidation, respondInviteValidation } from "../middleware/validator.js";

const router = express.Router();

router.post("/send", isAuthenticated, inviteValidation, invite);
router.patch("/respond", isAuthenticated, respondInviteValidation, responseInvite);
router.get("/", isAuthenticated, getInvitations);

export default router;