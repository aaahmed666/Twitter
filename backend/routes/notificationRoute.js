import express from "express";
import {
  deleteNotifications,
  getNotifications,
  deleteNotification,
} from "../controllers/notificationControllers.js";
import { protectedRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotifications);
router.delete("/:id", protectedRoute, deleteNotification);

export default router;
