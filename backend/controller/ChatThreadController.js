import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";

export async function createChatThread(req, res) {
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
}

export async function findAllChatThread(req, res) {
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
}

export async function findChatThreadOfUsers(req, res) {
  try {
    const chatThread = await ChatThread.findOne({
      members: { $all: [req.user.id, req.params.receiverID] },
    });

    if (!chatThread)
      return res.status(404).json({
        message: "NO USER FOUND",
      });

    return res.status(200).json({
      message: "Successfully obtained ChatThread of Users",
      body: chatThread,
    });
  } catch (err) {
    console.log("Error in finding chatThreadofUsers ", err.message);
    return res.status(500).json({
      message: err.message,
    });
  }
}

export async function findChatThreadByID(req, res) {
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
}

export async function findAllUserChatThread(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const { cursorUpdatedAt, cursorId } = req.query;

    // Base query: User must be a member
    let query = { members: { $in: [req.user.id] } };

    // If cursors are provided, fetch threads older than the cursor
    if (cursorUpdatedAt && cursorId) {
      query.$or = [
        { updatedAt: { $lt: new Date(cursorUpdatedAt) } },
        {
          updatedAt: new Date(cursorUpdatedAt),
          _id: { $lt: cursorId }, // Tie-breaker just in case timestamps are identical
        },
      ];
    }

    const chatThread = await ChatThread.find(query)
      .sort({ updatedAt: -1, _id: -1 }) // Sort by latest first
      .limit(limit)
      .populate({
        path: "members",
        match: { _id: { $ne: req.user.id } },
        select: "firstName middleName lastName profilePhoto",
      })
      .populate({
        path: "lastMessage",
      });

    return res.status(200).json({
      message: "Successfully obtained chat threads",
      body: chatThread,
    });
  } catch (err) {
    console.log("Error in fetching chat threads:", err.message);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function deleteChatThread(req, res) {
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
    const otherMember = chatThread.members.filter(
      (m) => m.toString() !== req.user.id.toString(),
    );

    const io = req.app.get("io");

    await Message.deleteMany({ chatThreadOrigin: req.params.id });
    await ChatThread.findByIdAndDelete(req.params.id);

    io.to(otherMember).emit("chatThread_deleted", {
      message: "Chat Thread has been deleted",
      chatThread: req.params.id,
    });
    io.to(req.user.id).emit("chatThread_deleted", {
      message: "Chat Thread has been deleted",
      chatThread: req.params.id,
    });

    return res.status(200).json({
      message: "Deleted Chat Thread",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
