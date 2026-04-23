import express from "express";
const router = express.Router();
import {
  findAllChatThread,
  createChatThread,
  findAllUserChatThread,
} from "../controller/ChatThreadController.js";

router.post(`/make`, createChatThread);

router.get(`/get`, findAllUserChatThread);
router.get(`/`, findAllChatThread);

export default router;
