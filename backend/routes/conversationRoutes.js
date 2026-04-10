import express from "express";
const router = express.Router();
import * as conversationController from "../controller/conversationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

router.post("/group", isAuthenticated, conversationController.createGroup);
router.get("/group/:conversationId", isAuthenticated, conversationController.getGroup);
router.put("/group/:conversationId", isAuthenticated, conversationController.updateGroupName);
router.delete("/group/:conversationId", isAuthenticated, conversationController.deleteGroup);

// add member in group
router.post("/group/add-member", isAuthenticated, conversationController.addMember);
router.post("/group/remove-member", isAuthenticated, conversationController.removeMember);

// private chat 
router.get("/", isAuthenticated, conversationController.getConversations);
router.get("/:conversationId", isAuthenticated, conversationController.getConversationById);
router.post("/", isAuthenticated, conversationController.createOrGetPrivateChat);
router.delete("/:conversationId", isAuthenticated, conversationController.deleteChat);

export default router;