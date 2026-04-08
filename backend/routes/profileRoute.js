import express from "express";
import {isAuthenticated} from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
    deleteProfile,
} from "../controller/profileController.js";

import {upload} from "../middleware/upload.js";

const router = express.Router();

router.get("/:userId", isAuthenticated, getProfile);
router.put("/:userId/edit", upload.single("profilePic"), isAuthenticated, updateProfile);
router.delete("/:userId/delete", isAuthenticated, deleteProfile);

export default router;