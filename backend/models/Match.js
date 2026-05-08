import mongoose from "mongoose";

const mathSchema = new mongoose.Schema(
  {
    adopterID: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Adopter",
      index: true,
    },
    petID: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "Pet",
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

const Match = mongoose.model("Match", mathSchema);
export default Match;
