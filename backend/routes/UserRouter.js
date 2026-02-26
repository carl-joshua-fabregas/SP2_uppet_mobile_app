import express from "express";
const router = express.Router();
import {createAdopter, findAllUser, findCurrentUser, findUserByID, updateUser, deleteAllUser, deleteUser} from "../controller/AdopterController.js";

// POST Requests
router.post("/post",    createAdopter);

// GET Requests
router.get("/all", findAllUser);
router.get("/me", findCurrentUser);
router.get("/:id", findUserByID);

// UPDATE Requests

router.patch("/update", updateUser);
//Delete Requests
router.delete("/:id", deleteUser);
router.delete("/all", deleteAllUser);

export default router;