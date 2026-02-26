import express from "express";
const router = express.Router();
import {authGoogle} from "../controller/authController.js";

router.post("/google", authGoogle);

export default router;
