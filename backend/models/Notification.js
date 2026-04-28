import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Adopter",
      required: true,
    },
    sender: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Adopter",
      required: true,
    },
    notifType: {
      type: String,
      enum: [
        // Review Events
        "RATING_RECEIVED",
        "RATING_UPDATED",
        "RATING_DELETED",
        // Pet Events
        "PET_LIVE",
        "PET_UPDATED",
        "PET_DELETED",
        // Application Events (Owner Side)
        "ADOP_APP_RECEIVED",
        "ADOP_APP_CANCELLED",
        "ADOP_APP_DELETED",
        // Application Events (Applicant Side)
        "ADOP_APP_APPROVED",
        "ADOP_APP_REJECTED",
        // New Adopter
        "ADOPTER_NEW",
        "ADOPTER_UPDATED",
      ],
      required: true,
    },
    relatedEntity: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      refPath: "entityModel",
    },
    entityModel: {
      type: String,
      enum: ["Rating", "Pet", "AdoptionApplication", "Adopter"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
//
