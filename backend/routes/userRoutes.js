import express from "express";
import { searchUser, getFriends, getSuggestions, getMe} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", isAuthenticated, getMe);
router.get("/search", isAuthenticated, searchUser);
router.get("/friends", isAuthenticated, getFriends);
router.get("/suggestion", isAuthenticated, getSuggestions);


export default router;