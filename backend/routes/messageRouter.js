import express from "express";
import { sendMessage, getMessage, sendFile, toggleReaction, deleteMessageForMe, deleteMessageForEveryone } from "../controller/messageController.js"

import { isAuthenticated } from "../middleware/authMiddleware.js";
import { handleUploadMiddleware } from "../middleware/upload.js";
import {
    sendMessageValidation,
    reactionValidation,
    deleteMessageValidation,
    conversationIdParamValidation
} from "../middleware/validator.js";

const router = express.Router();

router.post("/upload/:conversationId", isAuthenticated, handleUploadMiddleware, sendFile);
router.post("/upload", isAuthenticated, handleUploadMiddleware, sendFile);
router.post("/:conversationId", isAuthenticated, sendMessageValidation, sendMessage);
router.get("/:conversationId", isAuthenticated, conversationIdParamValidation, getMessage);
router.post("/react/:id", isAuthenticated, reactionValidation, toggleReaction);
router.delete("/delete/:id", isAuthenticated, deleteMessageValidation, deleteMessageForMe);
router.delete("/delete/me/:id", isAuthenticated, deleteMessageValidation, deleteMessageForEveryone);

export default router;