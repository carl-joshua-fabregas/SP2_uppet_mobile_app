import express from "express";
const router = express.Router();
import {
  createRating,
  findRatingByUserToUser,
  findRatingsOfUser,
  updateRating,
} from "../controller/RatingController.js";
// import { findAllUserNotification } from "../controller/NotificationController.js";

// router.get("/notifications", findAllUserNotification);
// router.get("/rating");
router.get("/myRating/:ratedID", findRatingByUserToUser);
router.get("/otherRatings/:ratedID", findRatingsOfUser);
router.post("/:ratedID", createRating);
router.patch("/:ratingID", updateRating);

export default router;
