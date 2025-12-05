const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
	notifRecipient: {
		type: mongoose.SchemaTypes.ObjectID,
		ref: "Adopter",
		required: true,
		index: true,
	},
	body: {
		type: String,
		required: true,
	},
	isRead: {
		type: Boolean,
		default: false,
		index: true,
	},
	timeStamp: {
		type: Date,
		default: Date.now,
		index: -1,
	},
	notifType: {
		type: String,
		required: true,
		enum: ["New Notification", "Approved", "Rejected", "Cancelled", "Applied"],
	},
});

module.exports = mongoose.model("Notification", notificationSchema);
