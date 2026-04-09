import express from "express";
import {isAuthenticated} from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
    deleteProfile,
    updatePic
} from "../controller/profileController.js";

import {upload} from "../middleware/upload.js";

const router = express.Router();

router.get("/:userId", isAuthenticated, getProfile);
router.put("/:userId/edit", upload.single("profilePic"), isAuthenticated, updateProfile);
router.delete("/:userId/delete", isAuthenticated, deleteProfile);
router.patch("/:userId/update-pic", upload.single("profilePic"), isAuthenticated, updatePic);


export default router;