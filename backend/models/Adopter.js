import mongoose from "mongoose";

const AdopterSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  income: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  livingCon: {
    type: String,
    required: true,
  },
  lifeStyle: {
    type: String,
    required: true,
  },
  householdMem: {
    type: Number,
    required: true,
  },
  currentOwnedPets: {
    type: Number,
    required: true,
  },
  hobies: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
});

const Adopter = mongoose.model("Adopter", AdopterSchema);
export default Adopter;
