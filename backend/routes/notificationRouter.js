import express from "express";
const router = express.Router();
import {
  findAllUserNotification,
  deleteUserNotification,
  markIsRead,
} from "../controller/NotificationController.js";

router.get("/notifications", findAllUserNotification);
router.patch("/:id", markIsRead);
router.delete("/:id", deleteUserNotification);
export default router;
