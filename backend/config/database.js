import mongoose from "mongoose";
// const seed = require("../../database/seed")

// seed();

export default async function connectToDatabase(dbURI) {
	try {
		await mongoose.connect(dbURI);
		console.log("Connected to MongoDB");
	} catch (err) {
		console.error("Error connecting to MongoDB:", err);
		process.exit(1);
	}
};

