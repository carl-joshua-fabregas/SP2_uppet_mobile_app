import express from "express";
const router = express.Router();
import {
  findMyListAdoptApp,
  findPetPendingApplicants,
  findPetApprovedApplicants,
  findPetRejectedApplicants,
  findPetUserApplication,
  createAdoptApp,
  approveAdoption,
  rejectApplicant,
  cancelAdoptApp,
  findAdoptAppByID,
} from "../controller/AdoptionApplicationController.js";

router.get("/myAdoptees", findMyListAdoptApp);

router.get("/:id/rejected", findPetRejectedApplicants);
router.get("/:id/approved", findPetApprovedApplicants);
router.get("/:id/pending", findPetPendingApplicants);
router.get("/:id/applied", findPetUserApplication);
router.get("/:id", findAdoptAppByID);

router.post("/applied", createAdoptApp);
router.post("/:id/approve", approveAdoption);
router.patch("/:id/reject", rejectApplicant);

router.delete("/:id/cancelled", cancelAdoptApp);

export default router;
