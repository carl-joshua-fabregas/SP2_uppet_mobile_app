const express = require("express");
const router = express.Router();
const petController = require("../controller/petController");

router.get("/all", petController.findAll);
router.get("/avail", petController.findAllAvailPets);
router.get("/:id", petController.findByID);
router.get("/", petController.findByFilter);

module.exports = router;
