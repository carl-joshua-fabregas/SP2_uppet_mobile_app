import express from "express";
const router = express.Router();
import {findMyListAdoptApp, findPetApplicants, findPetUserApplication, createAdoptApp, approveAdoption, rejectApplicant, cancelAdoptApp} from "../controller/AdoptionApplicationController.js";

router.get("/myAdoptees", findMyListAdoptApp);
router.get("/:id/applicants", findPetApplicants);
router.get("/:id/applied", findPetUserApplication);   
router.post("/applied", createAdoptApp);

router.post("/:id/approve", approveAdoption);
router.patch("/:id/reject", rejectApplicant);

router.delete("/:id/cancelled", cancelAdoptApp)


export default router;
