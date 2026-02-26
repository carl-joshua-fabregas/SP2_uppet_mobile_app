import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema({
  petToAdopt: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Pet",
    required: true,
    index: true,
  },
  applicant: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
    index: true,
  },

  status: {
    type: String,
    required: true,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending",
    index: true,
  },

  timeStamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const AdoptionApplication = mongoose.model(
  "AdoptionApplication",
  adoptionApplicationSchema
);

export default AdoptionApplication;