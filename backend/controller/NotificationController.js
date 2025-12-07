const Notification = require("../models/Notification");

const createNotification = async (req, res) => {
	try {
		const { notifRecipient, body, isRead, timeStamp, notifType } = req.body;
		const newNotif = await Notification({
			notifRecipient: notifRecipient,
			body: body,
			isRead: isRead,
			timeStamp: timeStamp,
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

const findAllNotification = async (req, res) => {
	try {
		const notifcations = await Notification.find({});

		if (!notifcations) {
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

const findAllUserNotification = async (req, res) => {
	try {
		const notifcations = await Notification.find(req.user.id);

		if (!notifcations) {
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

const deleteAllNotification = async (req, res) => {
	try {
		if (req.userRole.toString() !== "admin") {
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

const deleteAllUserNotification = async (req, res) => {
	try {
		const notification = await Notification.deleteMany({
			notifRecipient: req.user.id,
		});

		return res.status(200).json({
			message: "Successfully deleted Notification",
		});
	} catch (err) {
		return res.status(200).json({
			message: "Server Error",
			body: err.message,
		});
	}
};

const deleteUserNotification = async (req, res) => {
	try {
		const notification = await Notification.findByIdAndDelete(req.params.id);

		return res.status(200).json({
			message: "Successfully deleted Notification",
		});
	} catch (err) {
		return res.status(200).json({
			message: "Server Error",
			body: err.message,
		});
	}
};
modules.export = {};
