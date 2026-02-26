import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  notifRecipient: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
    index: true,
  },
  body: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
    index: -1,
  },
  notifType: {
    type: String,
    required: true,
    enum: ["New Notification", "Approved", "Rejected", "Cancelled", "Applied"],
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
//
