import express from "express";
const router = express.Router();
import {
  createAdopter,
  findAllUser,
  findCurrentUser,
  findUserByID,
  updateUser,
  deleteAllUser,
  deleteUser,
  presignDeleteURL,
  presignUploadURL,
  uploadAdopterPhoto,
} from "../controller/AdopterController.js";

// POST Requests
router.post("/post", createAdopter);
router.post("/presignUploadURL", presignUploadURL);

// GET Requests
router.get("/all", findAllUser);
router.get("/me", findCurrentUser);
router.get("/:id", findUserByID);

// UPDATE Requests

router.patch("/update", updateUser);
router.patch("/photo", uploadAdopterPhoto);

//Delete Requests
router.delete("/presignDeleteURL", presignDeleteURL);
router.delete("/:id", deleteUser);
router.delete("/all", deleteAllUser);

export default router;
