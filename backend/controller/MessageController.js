import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";

export async function sendMessage(req, res) {
  try {
    const options = {
      new: true,
      runValidator: true,
    };
    const { chatThreadOrigin, sender, receiver, body, media, isEdited } =
      req.body;

    const message = new Message({
      chatThreadOrigin: chatThreadOrigin,
      sender: sender,
      body: body,
      media: media,
      isEdited: isEdited,
    });

    const newMessage = await message.save();

    const updatedChatList = await ChatThread.findByIdAndUpdate(
      message.chatThreadOrigin,
      {
        $set: {
          lastMessage: message._id,
          timeStamp: Date.now(),
        },
      },
      options,
    ).populate("lastMessage");

    const io = req.app.get("io");
    
    // The frontend joins rooms named by sorting the two user IDs
    const roomID = [sender, receiver].sort().join("_");

    io.to(roomID).emit("receive_message", newMessage);
    io.to(receiver).emit("update_chatlist", updatedChatList);

    return res.status(200).json({
      message: "Successfully",
      body: newMessage,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function findMessagesFromUser(req, res){
  try{
    if(!req.query.lastMessageId){
      const messages = await Message.find({
        chatThreadOrigin: req.params.chatThreadOrigin,
      }).sort({ _id: -1 }).limit(10)
      return res.status(200).json({
      message: "Here are the messages found",
      body: messages
    })
    }
    const messages = await Message.find({
      chatThreadOrigin: req.params.chatThreadOrigin,
      _id: { $lt: req.query.lastMessageId }
    }).sort({ _id: -1 }).limit(10)
    
    if(messages.length === 0){
      return res.status(200).json({
        message: "No Messages Found",
        body: []
      })
    }
    console.log("MESSAGES----------------", messages[0]._id, req.query.lastMessageId);
    console.log("MESSAGES2----------------", messages[messages.length - 1]._id);
    return res.status(200).json({
      message: "Here are the messages found",
      body: messages
    })
  } catch (err){
    console.log("Error in finding user to user messages", err.message)
    return res.status(500).json({
      message: "Server Error"
    })
  }
}
export async function findMessageById(req, res) {
  try {
    const chatThread = await ChatThread.findById(req.params.chatThreadId);
    if (!chatThread) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const isMember = await chatThread.members.some((memberID) => {
      return memberID.toString() === req.user.id.toString();
    });

    if (!isMember) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const message = await Message.find({ chatThreadOrigin: chatThread.id })
      .sort({ timeStamp: 1 })
      .populate("sender");

    return res.status(200).json({
      message: "Successfully Obtained Message",
      body: message,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteAMessage(req, res) {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    if (
      message.sender.toString() !== req.user.id.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Successfully deleted user message",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
