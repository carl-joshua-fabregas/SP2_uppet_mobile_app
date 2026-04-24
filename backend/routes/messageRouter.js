import express from "express";
const router = express.Router();

import { sendMessage, findMessagesFromUser } from "../controller/MessageController.js";

router.post(`/send`, sendMessage);

router.get(`/:chatThreadOrigin`, findMessagesFromUser)

export default router;
