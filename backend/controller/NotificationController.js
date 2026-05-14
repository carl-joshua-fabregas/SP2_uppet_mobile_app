import Notification from "../models/Notification.js";

export async function createNotification(req, res) {
  try {
    const { notifRecipient, body, notifType, relatedEntiy, entityModel } =
      req.body;
    const newNotif = new Notification({
      recipient: notifRecipient,
      body: body,
      notifType: notifType,
      relatedEntiy: relatedEntiy,
      entityModel: entityModel,
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
}

export async function findAllNotification(req, res) {
  try {
    const notifications = await Notification.find({});

    if (notifications.length === 0) {
      return res.status(200).json({
        message: "No notifications found",
        body: [],
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
}

export async function findAllUserNotification(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursorID = req.query.cursorID || null;

    if (!cursorID) {
      const notifications = await Notification.find({
        recipient: req.user.id,
      })
        .sort({ createdAt: -1 })
        .limit(limit);
      if (notifications.length == 0) {
        return res.status(200).json({
          message: "There are no notifications",
          body: [],
        });
      }
      return res.status(200).json({
        message: "Successfully obtained Notifications",
        body: notifications,
      });
    }

    const notifications = await Notification.find({
      recipient: req.user.id,
      _id: { $lt: cursorID },
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    if (notifications.length == 0) {
      return res.status(200).json({
        message: "No notifications found",
        body: [],
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
}

export async function deleteAllNotification(req, res) {
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
}

export async function deleteAllUserNotification(req, res) {
  try {
    const userNotif = await Notification.deleteMany({
      recipient: req.user.id,
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
}
export async function markIsRead(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification)
      return res.status(404).json({
        message: "Notification not found",
      });
    if (
      req.user.id.toString() !== notification.recipient.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (notification.isRead) {
      return res.status(409).json({
        message: "Notification is already read",
      });
    }

    const notifUpdate = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isRead: true },
      },
      { new: true },
    );
    return res.status(200).json({
      message: "Successful Marking",
      body: notifUpdate,
    });
  } catch (err) {
    console.log("Error marking is read in notification");
    return res.status(500).json({
      message: "Server Error in marking is read",
      body: err.message,
    });
  }
}
export async function deleteUserNotification(req, res) {
  try {
    const user = await Notification.findById(req.params.id);

    if (
      req.user.id.toString() !== user.recipient.toString() &&
      req.user.role.toString() !== "admin"
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    const notification = await Notification.findByIdAndDelete(req.params.id);
    const io = req.app.get("io");

    io.to(req.user.id).emit("notification_deleted", {
      message: "A notification has been deleted",
      notification: user.id,
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
}
