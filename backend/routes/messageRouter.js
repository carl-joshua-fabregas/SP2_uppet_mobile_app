import express from "express";
const router = express.Router();

import {
  sendMessage,
  findMessagesFromUser,
  presignDeleteURL,
  presignUploadURL,
  editAMessage,
  deleteAMessage,
} from "../controller/MessageController.js";

router.post(`/send`, sendMessage);
router.post(`/presignUploadURL`, presignUploadURL);
router.post(`/presignDeleteURL`, presignDeleteURL);

router.patch(`/edit/:messageId`, editAMessage);
router.get(`/:chatThreadOrigin`, findMessagesFromUser);
router.delete(`/delete/:id`, deleteAMessage);
export default router;
