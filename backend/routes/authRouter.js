const express = require("express");
const router = express.Router();
const authGoogle = require("../controller/authController");

router.post("/google", authGoogle);

module.exports = router;
