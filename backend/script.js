const express = require("express");
const mongoose = require("mongoose");
const app = express();
const connectToDatabase = require("./config/database");

require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sp2_uppet";

connectToDatabase(MONGODB_URI);

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is running on port " + PORT);
});
