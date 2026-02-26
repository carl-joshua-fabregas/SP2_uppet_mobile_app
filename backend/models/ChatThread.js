import mongoose from "mongoose";

const chatThreadSchema = new mongoose.Schema({
  members: {
    type: [mongoose.SchemaTypes.ObjectId],
    ref: "Adopter",
    required: true,
  },

  lastMessage: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Message",
    required: false,
    index: true,
  },

  timeStamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const ChatThread = mongoose.model("ChatThread", chatThreadSchema);
export default ChatThread;