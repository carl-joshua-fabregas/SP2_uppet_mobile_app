const mongoose = require("mongoose");

const chatThreadSchema = new mongoose.Schema({
  members: {
    type: [mongoose.SchemaTypes.ObjectID],
    ref: "Adopter",
    required: true,
  },

  lastMessage: {
    type: mongoose.SchemaTypes.ObjectID,
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

module.exports = mongoose.model("ChatThread", chatThreadSchema);
