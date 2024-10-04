import express from "express";
import {
  createPost,
  deletePost,
  commentPost,
  likeUnLikePost,
  getAllPosts,
  getLikedPosts,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/postsController.js";
import { protectedRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPosts);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/likes/:id", protectedRoute, getLikedPosts);
router.get("/user/:username", protectedRoute, getUserPosts);
router.post("/create", protectedRoute, createPost);
router.delete("/:id", protectedRoute, deletePost);
router.post("/comment/:id", protectedRoute, commentPost);
router.post("/like/:id", protectedRoute, likeUnLikePost);

export default router;
