const express = require("express");
const { cp } = require("fs");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sp2_uppet";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
