import express from "express";
const router = express.Router();
import {
  createRating,
  findRatingByUserToUser,
  findRatingsOfUser,
  updateRating,
  deleteRating,
  findRatingByID,
} from "../controller/RatingController.js";
// import { findAllUserNotification } from "../controller/NotificationController.js";

// router.get("/notifications", findAllUserNotification);
router.get("/myRating/:ratedID", findRatingByUserToUser);
router.get("/otherRatings/:ratedID", findRatingsOfUser);
router.get("/:id", findRatingByID);
router.post("/:ratedID", createRating);
router.patch("/:ratingID", updateRating);

router.delete("/:ratingID", deleteRating);

export default router;
