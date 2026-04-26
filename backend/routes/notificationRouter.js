import express from "express";
const router = express.Router();
import { findAllUserNotification } from "../controller/NotificationController.js";

router.get("/notifications", findAllUserNotification);

export default router;
