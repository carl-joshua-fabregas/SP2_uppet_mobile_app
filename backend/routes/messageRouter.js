import express from "express";
const router = express.Router();

import { sendMessage } from "../controller/MessageController.js";

router.post(`/send`, sendMessage);

export default router;
