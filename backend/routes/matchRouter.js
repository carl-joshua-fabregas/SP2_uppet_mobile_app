import express from "express";
import { findUserMatchedPet } from "../controller/MatchController.js";
const router = express.Router();

router.get("/bestMatch", findUserMatchedPet);

export default router;
