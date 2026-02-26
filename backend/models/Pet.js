import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  sex: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  species: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  vaccination: {
    type: String,
    required: true,
  },
  sn: {
    type: String,
    required: true,
  },
  healthCond: {
    type: String,
    required: true,
  },
  behavior: {
    type: String,
    required: true,
  },
  specialNeeds: {
    type: String,
    required: true,
  },
  adoptedStatus: {
    type: Number,
    required: true,
    default: 1,
  },
  otherInfo: {
    type: String,
    required: false,
  },
  photos: {
    type: [
      {
        key: {
          type: String,
          required: true},
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          required: false,
        },
        timeStamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
        isProfile: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
