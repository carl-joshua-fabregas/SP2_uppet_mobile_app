import express from "express";
const router = express.Router();
import {createPet, presignUploadURL, uploadPetPhoto, findAll, findAllAvailPets, findMyPets, findByFilter, findByID, updatePet,deleteAll, deleteByID, deletePetPhoto} from "../controller/PetController.js";

// POST Requests
router.post("/post", createPet);
router.post("/presignUploadURL", presignUploadURL);
router.post("/:id/photo", uploadPetPhoto);

// GET Requests
router.get("/all", findAll);
router.get("/avail", findAllAvailPets);
router.get("/myPets", findMyPets);

router.get("/", findByFilter);
router.get("/:id", findByID);

// UPDATE Requests

router.patch("/:id", updatePet);
router.patch("/:id/photo", uploadPetPhoto);

//Delete Requests
router.delete("/", deleteAll);
router.delete("/:id", deleteByID);
router.delete("/:id/photo/:photoId", deletePetPhoto);

export default router;
