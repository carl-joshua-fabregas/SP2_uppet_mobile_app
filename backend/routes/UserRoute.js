const express = require("express");
const router = express.Router();
const adopterController = require("../controller/AdopterController");

// POST Requests
router.post("/post", adopterController.createPet);

// GET Requests
router.get("/all", adopterController.findAll);
router.get("/avail", adopterController.findAllAvailPets);
router.get("/", adopterController.findByFilter);
router.get("/:id", adopterController.findByID);

// UPDATE Reqiests

router.patch("/:id", adopterController.updatePet);
router.patch("/:id/photo", adopterController.uploadPetPhoto);

//Delete Requests
router.delete("/", adopterController.deleteAll);
router.delete("/:id", adopterController.deleteByID);
router.delete("/:id/photo/:photoId", adopterController.deletePetPhoto);

module.exports = router;
