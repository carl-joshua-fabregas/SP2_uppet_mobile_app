const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
	ratedUser: {
		type: mongoose.SchemaTypes.ObjectID,
		ref: "Adopter",
		required: true,
		index: true,
	},
	score: {
		type: Number,
		required: true,
		min: 1,
		max: 5,
	},
	reviewer: {
		type: mongoose.SchemaTypes.ObjectID,
		ref: "Adopter",
		required: true,
	},
	body: {
		type: String,
		required: false,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("Rating", ratingSchema);
