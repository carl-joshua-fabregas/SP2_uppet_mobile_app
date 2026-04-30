import ChatThread from "../models/ChatThread.js";
import Message from "../models/Messages.js";
import { ObjectId } from "mongodb";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
console.log("AWS REGION:", process.env.AWS_REGION);
console.log("AWS ACCESS KEY ID:", process.env.AWS_ACCESS_KEY_ID);
console.log("AWS SECRET ACCESS KEY:", process.env.AWS_SECRET_ACCESS_KEY);
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function presignUploadURL(req, res) {
  try {
    const key = `message/${req.user.id}/${req.body.fileSize}_${req.body.fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: req.body.fileType,
      // Metadata:{
      //   uri: req.body.uri || "",
      //   name: req.body.name || ""
      // }
    });
    console.log(
      process.env.AWS_BUCKET_NAME,
      process.env.AWS_REGION,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );
    console.log("GENERATING PRESIGNED URL FOR KEY:", key);
    console.log("WITH COMMAND:", command);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("PRESIGNED URL GENERATED:", url);
    const finalUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    console.log("FINAL URL GENERATED:", finalUrl);
    return res.status(200).json({
      message: "Successfully obtained presigned URL",
      body: { url: url, key: key, finalUrl: finalUrl },
    });
  } catch (err) {
    console.log("ERROR IN GENERATING PRESIGNED URL:", err);
    return res.status(505).json({
      message: "Server Error",
      body: err.message,
    });
  }
}

export async function presignDeleteURL(req, res) {
  try {
    console.log("GENERATING presignDeleteURL");
    const key = req.body.key;
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    console.log(
      process.env.AWS_BUCKET_NAME,
      process.env.AWS_REGION,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
    );
    console.log("GENERATING PRESIGNED URL FOR KEY:", key);
    console.log("WITH COMMAND:", command);

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("PRESIGNED URL GENERATED:", url);

    return res.status(200).json({
      message: "Successfully obtained presigned URL",
      body: { url: url, key: key },
    });
  } catch (err) {
    console.log("ERROR IN GENERATING PRESIGNED URL:", err);
    return res.status(505).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function sendMessage(req, res) {
  try {
    const options = {
      new: true,
      runValidator: true,
    };
    const { chatThreadOrigin, sender, receiver, body, media, isEdited } =
      req.body;
    console.log("media is", media);

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
    console.log("Error in sending message", err.message);
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
}
export async function findMessagesFromUser(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    if (!req.query.lastMessageId) {
      const messages = await Message.find({
        chatThreadOrigin: req.params.chatThreadOrigin,
      })
        .sort({ createdAt: -1 })
        .limit(limit);
      return res.status(200).json({
        message: "Here are the messages found",
        body: messages,
      });
    }
    const messages = await Message.find({
      chatThreadOrigin: req.params.chatThreadOrigin,
      _id: { $lt: new ObjectId(req.query.lastMessageId) },
    })
      .sort({ _id: -1 })
      .limit(limit);

    if (messages.length === 0) {
      return res.status(200).json({
        message: "No Messages Found",
        body: [],
      });
    }
    console.log(
      "MESSAGES----------------",
      messages[0]._id,
      req.query.lastMessageId,
    );
    console.log("MESSAGES2----------------", messages[messages.length - 1]._id);
    return res.status(200).json({
      message: "Here are the messages found",
      body: messages,
    });
  } catch (err) {
    console.log("Error in finding user to user messages", err.message);
    return res.status(500).json({
      message: "Server Error",
    });
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
