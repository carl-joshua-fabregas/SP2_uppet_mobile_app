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
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
}, {timestamps: true});

messageSchema.virtual("isEdited").get(function(){
  if (!this.createdAt || this.updatedAt) return false
  return this.updatedAt.getTime() > this.createdAt.getTime()
})

messageSchema.set("toJSON", {virtuals: true});
messageSchema.set("toObject", {virtuals: true})
const Message = mongoose.model("Message", messageSchema);
export default Message;
