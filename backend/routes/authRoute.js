import express from "express";
import { login, logout, signup, getMe } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectedRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
