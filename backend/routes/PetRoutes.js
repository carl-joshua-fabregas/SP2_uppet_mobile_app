const express = require("express");
const router = express.Router();
const petController = require("../controller/petController");

// POST Requests
router.post("/post", petController.createPet);

// GET Requests
router.get("/all", petController.findAll);
router.get("/avail", petController.findAllAvailPets);
router.get("/myPets", petController.findMyPets);

router.get("/", petController.findByFilter);
router.get("/:id", petController.findByID);

// UPDATE Reqiests

router.patch("/:id", petController.updatePet);
router.patch("/:id/photo", petController.uploadPetPhoto);

//Delete Requests
router.delete("/", petController.deleteAll);
router.delete("/:id", petController.deleteByID);
router.delete("/:id/photo/:photoId", petController.deletePetPhoto);

module.exports = router;
