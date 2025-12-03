const mongoose = require("mongoose");

const adoptionApplicationSchema = new mongoose.Schema({
  petToAdopt: {
    type: mongoose.SchemaTypes.ObjectID,
    ref: "Pet",
    required: true,
    index: true,
  },
  applicant: {
    type: mongoose.SchemaTypes.ObjectID,
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

module.exports = mongoose.model(
  "AdoptionApplication",
  adoptionApplicationSchema
);
