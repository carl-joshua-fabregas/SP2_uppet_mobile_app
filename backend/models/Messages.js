const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
	chatThreadOrigin: {
		type: mongoose.SchemaTypes.ObjectID,
		ref: "ChatThread",
		required: true,
		index: true,
	},
	sender: {
		type: mongoose.SchemaTypes.ObjectID,
		ref: "Adopter",
		required: true,
	},
	body: {
		type: String,
		required: true,
		default: "",
	},
	media: {
		url: {
			type: String,
		},
		type: {
			type: String,
			enum: ["image", "video"],
		},
	},
	timeStamp: {
		type: Date,
		default: Date.now,
		required: true,
	},
});

module.exports = mongoose.model("Message", messageSchema);
