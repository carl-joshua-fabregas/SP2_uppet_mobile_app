import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  chatThreadOrigin: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "ChatThread",
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Adopter",
    required: true,
  },
  body: {
    type: String,
    required: true,
    default: "",
  },
  media: {
    url: {
      type: String,
    },
    type: {
      type: String,
      enum: ["image", "video"],
    },
  },
  timeStamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
