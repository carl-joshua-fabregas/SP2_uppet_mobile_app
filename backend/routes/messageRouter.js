import express from "express";
const router = express.Router();

import {
  sendMessage,
  findMessagesFromUser,
  presignDeleteURL,
  presignUploadURL,
} from "../controller/MessageController.js";

router.post(`/send`, sendMessage);
router.post(`/presignUploadURL`, presignUploadURL);
router.post(`/presignDeleteURL`, presignDeleteURL);
router.get(`/:chatThreadOrigin`, findMessagesFromUser);

export default router;
