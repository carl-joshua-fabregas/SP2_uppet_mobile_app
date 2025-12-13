const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const connectToDatabase = require("./config/database");
require("dotenv").config();

const corsOption = {
  origin: "*",
  methods: "GET, POST, PUT, PATCH, DELETE",
  credentials: true,
};

const petRouter = require("./routes/PetRouter");
const authMiddleWare = require("./middleware/authMiddleware");
const authGoogle = require("./routes/authRouter");
const adoptionAppRouter = require("./routes/adoptionAppRouter");
const notificationRouter = require("./routes/notificationRouter");

app.use(cors(corsOption));
app.use(express.json());

app.use("/api/auth", authGoogle);

app.use(authMiddleWare);
app.use("/api/pet", petRouter);
app.use("/api/adoptionApp", adoptionAppRouter);
app.use("/api/notification", notificationRouter);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sp2_uppet";

connectToDatabase(MONGODB_URI);

app.get("/", (req, res) => {
  res.send("Welcome to the SP2 Uppet Mobile App Backend!");
  console.log("Root endpoint accessed");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("server is running on port " + PORT);
});
