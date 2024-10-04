import express from "express";
import {
  followUnfollowUser,
  getUserProfile,
  suggestedUser,
  updateUserProfile,
} from "../controllers/usersController.js";
import { protectedRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, suggestedUser);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUserProfile);

export default router;
