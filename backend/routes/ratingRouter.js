import express from "express";
const router = express.Router();
import {
  createRating,
  findRatingByUserToUser,
  findRatingsOfUser,
  updateRating,
  deleteRating,
} from "../controller/RatingController.js";
// import { findAllUserNotification } from "../controller/NotificationController.js";

// router.get("/notifications", findAllUserNotification);
// router.get("/rating");
router.get("/myRating/:ratedID", findRatingByUserToUser);
router.get("/otherRatings/:ratedID", findRatingsOfUser);
router.post("/:ratedID", createRating);
router.patch("/:ratingID", updateRating);

router.delete("/delete", deleteRating);

export default router;
