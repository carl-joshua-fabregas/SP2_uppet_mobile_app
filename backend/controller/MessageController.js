const Message = require("../models/Messages");
const ChatThread = require("../models/ChatThread");

const sendMessage = async (req, res) => {
  try {
    const options = {
      new: true,
      runValidator: true,
    };
    const { chatThreadOrigin, sender, body, media } = req.body;

    const message = new Message({
      chatThreadOrigin: chatThreadOrigin,
      sender: sender,
      body: body,
      media: media,
    });

    const newMessage = await message.save();

    await ChatThread.findByIdAndUpdate(
      message.chatThreadOrigin,
      {
        $set: {
          lastMessage: message._id,
          timeStamp: Date.now(),
        },
      },
      options
    );

    return res.status(200).json({
      message: "Succsefully",
      body: newMessage,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

const findMessageById = async (req, res) => {
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
};

const deleteAMessage = async (req, res) => {
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
};

module.exports = { sendMessage, findMessageById, deleteAMessage };
