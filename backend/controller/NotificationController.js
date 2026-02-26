import Notification from "../models/Notification.js";

export async function createNotification (req, res) {
  try {
    const { notifRecipient, body, notifType } = req.body;
    const newNotif = new Notification({
      notifRecipient: notifRecipient,
      body: body,
      notifType,
    });

    const status = await newNotif.save();

    return res.status(200).json({
      message: "Successful in making notification",
      body: status,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllNotification (req, res) {
  try {
    const notifications = await Notification.find({});

    if (notifications.length == 0) {
      return res.status(404).json({
        message: "No notifications found",
      });
    }

    return res.status(200).json({
      message: "Successfully obtained Notifications",
      body: notifications,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function findAllUserNotification (req, res) {
  try {
    const notifications = await Notification.find({
      notifRecipient: req.user.id,
    })
      .skip((req.params.page - 1) * 10)
      .limit(10);

    if (notifications.length == 0) {
      return res.status(404).json({
        message: "No notifications found",
      });
    }

    return res.status(200).json({
      message: "Successfully obtained Notifcations",
      body: notifications,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteAllNotification (req, res) {
  try {
    if (req.user.role.toString() !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    await Notification.deleteMany({});
    return res.status(200).json({
      message: "Successfully deleted all notification int the server",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteAllUserNotification (req, res) {
  try {
    const userNotif = await Notification.deleteMany({
      notifRecipient: req.user.id,
    });

    return res.status(200).json({
      message: "Successfully deleted Notification",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};

export async function deleteUserNotification (req, res) {
  try {
    const user = await Notification.findById(req.params.id);

    if (
      req.user.id.toString() !== user.notifRecipient.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const notification = await Notification.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Successfully deleted Notification",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
      body: err.message,
    });
  }
};
