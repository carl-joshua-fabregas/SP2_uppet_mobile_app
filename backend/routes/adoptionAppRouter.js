const express = require("express");
const router = express.Router();
const adoptionAppController = require("../controller/AdoptionApplicationController");

router.get("/myAdoptees", adoptionAppController.findMyListAdoptees);
router.get("/:id/applicants", adoptionAppController.findPetApplicants);
router.patch("/:id/approve", adoptionAppController.approveAdoption);
router.patch("/:id/reject", adoptionAppController.rejectApplicant);

module.exports = router;
