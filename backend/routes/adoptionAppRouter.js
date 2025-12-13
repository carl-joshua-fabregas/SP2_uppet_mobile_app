const express = require("express");
const router = express.Router();
const adoptionAppController = require("../controller/AdoptionApplicationController");

router.get("/myAdoptees", adoptionAppController.findMyListAdoptees);

module.exports = router;
