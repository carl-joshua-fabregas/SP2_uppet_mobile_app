const express = require("express");
const mongoose = require("mongoose");
const app = express();
const connectToDatabase = require("./config/database");
require("dotenv").config();

const petRouter = require("./routes/PetRoutes");
const mockmidware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(mockmidware);

app.use("/api/pet", petRouter);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sp2_uppet";

connectToDatabase(MONGODB_URI);

app.get("/", (req, res) => {
  res.send("Welcome to the SP2 Uppet Mobile App Backend!");
  console.log("Root endpoint accessed");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
