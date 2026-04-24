import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";
const options = {
  new: true,
  runValidator: true,
};
export async function saveMessageToDb(messageData) {
  try {
    const { chatThreadOrigin, sender, body, media, isEdited } = messageData;

    const message = new Message({
      chatThreadOrigin: chatThreadOrigin,
      sender: sender,
      body: body,
      media: media,
      isEdited: isEdited,
    });
    const newMessage = await message.save();

    const updatedChatList = await ChatThread.findByIdAndUpdate(
      chatThreadOrigin,
      { $set: { lastMessage: newMessage._id, timeStamp: Date.now() } },
      options,
    ).populate("lastMessage");
    return (newMessage, updatedChatList);
  } catch (err) {
    console.log("ERROR IN SAVE MESSAGE TO DB services");
  }
}

export async function setMessageStatusToDeliver(messageData) {
  try {
    const { messageID } = messageData;
    const updateMessages = await Message.findByIdAndUpdate(
      messageID,
      { $set: { status: "delivered" } },
      options,
    );

    return updateMessages;
  } catch (Err) {
    console.log("Error in setting message to deliver");
  }
}
