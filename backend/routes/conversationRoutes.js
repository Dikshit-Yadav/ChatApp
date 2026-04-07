import express from "express";
import { conversation, getConversations, deleteChat, createGroup, getGroup, updateGroupName, deleteGroup, addMember } from "../controller/conversationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:conversationId", isAuthenticated, getConversations);
router.post("/", isAuthenticated, conversation);

// private chat delete
router.delete("/:conversationId", isAuthenticated, deleteChat);

// create a new group
router.post("/group", isAuthenticated, createGroup);
// a specific group
router.get("/group/:conversationId", isAuthenticated, getGroup);
// update group name
router.put("/group/:conversationId", isAuthenticated, updateGroupName);
// delete a group
router.delete("/group/:conversationId", isAuthenticated, deleteGroup);
// Add member to a group
router.post("/group/add-member", isAuthenticated, addMember);


export default router;