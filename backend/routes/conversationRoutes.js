import express from "express";
const router = express.Router();
import * as conversationController from "../controller/conversationController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import {
    createGroupValidation,
    renameGroupValidation,
    addMemberValidation,
    removeMemberValidation,
    conversationIdParamValidation
} from "../middleware/validator.js";

router.post("/group", isAuthenticated, createGroupValidation, conversationController.createGroup);
router.get("/group/:conversationId", isAuthenticated, conversationIdParamValidation, conversationController.getGroup);
router.get("/groups", isAuthenticated, conversationController.getGroups);
router.put("/group/:conversationId", isAuthenticated, renameGroupValidation, conversationController.updateGroupName);
router.delete("/group/:conversationId", isAuthenticated, conversationIdParamValidation, conversationController.deleteGroup);

// add member in group
router.post("/group/add-member", isAuthenticated, addMemberValidation, conversationController.addMember);
router.post("/group/remove-member", isAuthenticated, removeMemberValidation, conversationController.removeMember);

// private chat 
router.get("/", isAuthenticated, conversationController.getConversations);
router.get("/:conversationId", isAuthenticated, conversationIdParamValidation, conversationController.getConversationById);
router.post("/", isAuthenticated, conversationController.createOrGetPrivateChat);
router.delete("/:conversationId", isAuthenticated, conversationIdParamValidation, conversationController.deleteChat);

export default router;