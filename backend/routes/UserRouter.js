const express = require("express");
const router = express.Router();
const adopterController = require("../controller/AdopterController");

// POST Requests
router.post("/post", adopterController.createAdopter);

// GET Requests
router.get("/all", adopterController.findAllUser);
router.get("/me", adopterController.findCurrentUser);
router.get("/:id", adopterController.findUserByID);

// UPDATE Reqiests

router.patch("/update", adopterController.updateUser);
//Delete Requests
router.delete("/:id", adopterController.deleteUser);
router.delete("/all", adopterController.deleteAllUser);

module.exports = router;
