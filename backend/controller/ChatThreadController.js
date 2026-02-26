
import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";

export async function createChatThread (req, res) {
  try {
    const { members, lastMessage } = req.body;
    const chatThread = new ChatThread({
      members: members,
      lastMessage: lastMessage,
    });

    const newChatThread = await chatThread.save();
    return res.status(200).json({
      message: "Successfully created Chat Thread",
      body: newChatThread,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllChatThread (req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const chatThread = await ChatThread.find({});
    if (chatThread.length == 0) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    return res.status(200).json({
      message: "Successfully obtained all chat threads",
      body: chatThread,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findChatThreadByID (req, res) {
  try {
    const chatThread = await ChatThread.findById(req.params.id);
    if (!chatThread) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    const isMember = chatThread.members.some((memberID) => {
      return memberID.toString() === req.user.id.toString();
    });

    if (!isMember && req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    return res.status(200).json({
      message: "Succesfully obtained chat thread",
      body: chatThread,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteChatThread (req, res) {
  try {
    const chatThread = await ChatThread.findById(req.params.id);
    if (!chatThread) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const isMember = chatThread.members.some((memberID) => {
      return req.user.id.toString() === memberID.toString();
    });

    if (!isMember) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    await Message.deleteMany({ chatThreadOrigin: req.params.id });
    await ChatThread.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      message: "Deleted Chat Thread",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

