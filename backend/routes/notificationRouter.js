const express = require("express");
const router = express.Router();
const notificationController = require("../controller/NotificationController");

router.get("/notification", notificationController.findAllUserNotification);

module.exports = router;
