import express from "express";
const router = express.Router();
import * as conversationController from "../controller/conversationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

// Private chat
router.get("/", isAuthenticated, conversationController.getConversations); // all conversations
router.get("/:conversationId", isAuthenticated, conversationController.getConversationById); // single conversation
router.post("/", isAuthenticated, conversationController.createOrGetPrivateChat); // create or get private chat
router.delete("/:conversationId", isAuthenticated, conversationController.deleteChat);

// Group chat
router.post("/group", isAuthenticated, conversationController.createGroup);
router.get("/group/:conversationId", isAuthenticated, conversationController.getGroup);
router.put("/group/:conversationId", isAuthenticated, conversationController.updateGroupName);
router.delete("/group/:conversationId", isAuthenticated, conversationController.deleteGroup);
router.post("/group/add-member", isAuthenticated, conversationController.addMember);

export default router;