import express from "express";
const router = express.Router();
import {
  findMyListAdoptApp,
  findPetPendingApplicants,
  findPetApprovedApplicants,
  findPetRejectedApplicants,
  findPetUserApplication,
  findMyPetApprovedApplications,
  findMyPetRejectedApplications,
  findMyPetPendingApplications,
  createAdoptApp,
  approveAdoption,
  rejectApplicant,
  cancelAdoptApp,
  findAdoptAppByID,
  reapplyUpdateAdoptionApp,
} from "../controller/AdoptionApplicationController.js";

router.get("/my/approved", findMyPetApprovedApplications);
router.get("/my/rejected", findMyPetRejectedApplications);
router.get("/my/pending", findMyPetPendingApplications);

router.get("/:id/rejected", findPetRejectedApplicants);
router.get("/:id/approved", findPetApprovedApplicants);
router.get("/:id/pending", findPetPendingApplicants);

router.get("/:id/applied", findPetUserApplication);
router.get("/:id", findAdoptAppByID);

router.post("/applied", createAdoptApp);

router.post("/:id/approve", approveAdoption);
router.patch("/:id/reject", rejectApplicant);
router.patch("/:id/reapply", reapplyUpdateAdoptionApp);
router.patch("/:id/cancelled", cancelAdoptApp);

export default router;
