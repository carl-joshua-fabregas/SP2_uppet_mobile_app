import mongoose from "mongoose";
import Adopter from "./Adopter.js";

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
  }
}, {timestamps: true});

ratingSchema.statics.calculateAverageRatings = async function (userID) {
  const stats = await this.aggregate([
    {$match: {ratedUser: userID}},
    {$group: {
      _id: "$ratedUser",
      avarageRating: {$avg: "$score"},
      totalRating: {$sum: 1},
    }}
  ])
  if(stats.length > 0){
    await Adopter.findByIdAndUpdate(userID, {
      totalRating: stats[0].totalRating,
      avarageRating: stats[0].avarageRating
    })
  } else {
    await Adopter.findByIdAndUpdate(userID,{
      totalRating: 0,
      avarageRating: 0
    })
  }
}

ratingSchema.post("save", function() {
  this.constructor.calculateAverageRatings(this.ratedUser)
})
ratingSchema.post(/^findOneAnd/, async function (doc) {
  if(doc) {
    await doc.constructor.calculateAverageRatings(doc.ratedUser)
  }  
})
const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
//
