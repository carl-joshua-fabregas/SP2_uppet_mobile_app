import express from "express";
const router = express.Router();
import {
  findAllChatThread,
  createChatThread,
  findAllUserChatThread,
  findChatThreadOfUsers,
} from "../controller/ChatThreadController.js";

router.post(`/make`, createChatThread);

router.get(`/get`, findAllUserChatThread);
router.get(`/get/:receiverID`, findChatThreadOfUsers);

router.get(`/`, findAllChatThread);

export default router;
