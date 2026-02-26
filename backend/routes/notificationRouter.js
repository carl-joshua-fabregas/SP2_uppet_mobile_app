import express from "express";
const router = express.Router();
import {findAllUserNotification} from "../controller/NotificationController.js";

router.get("/notification", findAllUserNotification);

export default router;
