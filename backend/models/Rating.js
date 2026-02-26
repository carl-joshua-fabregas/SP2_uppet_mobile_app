import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  ratedUser: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
    index: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  reviewer: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
  },
  body: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
//
