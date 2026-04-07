    import express from "express";
    import {sendMessage,getMessage,sendFile} from "../controller/messageController.js"

    import { isAuthenticated } from "../middleware/authMiddleware.js";
    import { upload } from "../middleware/upload.js";

    const router = express.Router();

    router.post("/:conversationId",isAuthenticated,sendMessage);
    router.get("/:conversationId", isAuthenticated, getMessage);
    router.post("/upload", isAuthenticated, upload.single("file"),sendFile);

    export default router;