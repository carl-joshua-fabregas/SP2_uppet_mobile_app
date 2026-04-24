import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";
const options = {
  new: true,
  runValidator: true,
};


export async function setMessageStatusToDeliver(messageData) {
  try {
    const { messageID } = messageData;
    const updateMessages = await Message.findByIdAndUpdate(
      messageID,
      { $set: { status: "delivered" } },
      options,
    );

    return { updateMessages };
  } catch (Err) {
    console.log("Error in setting message to deliver");
  }
}

export async function setMessageStatusToRead(chatThreadOrigin, receiverId) {
  try {
    // Update all messages in this thread where the receiver is the one reading them, and they aren't 'read' yet
    const updateResult = await Message.updateMany(
      { 
        chatThreadOrigin: chatThreadOrigin,
        sender: { $ne: receiverId }, // Only update messages the OTHER person sent
        status: { $in: ["sent", "delivered"] }
      },
      { $set: { status: "read" } }
    );

    return { updateResult };
  } catch (err) {
    console.log("Error in setting messages to read", err.message);
  }
}
