import express from "express";
const router = express.Router();
import { createRating } from "../controller/RatingController.js";
// import { findAllUserNotification } from "../controller/NotificationController.js";

// router.get("/notifications", findAllUserNotification);
// router.get("/rating");
router.post("/:ratedID", createRating);
// router.patch("/:ratingID");
// router.delete("/:ratingID")

export default router;
