import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectToDatabase from "./config/database.js";

const app = express();

const corsOption = {
  origin: "*",
  methods: "GET, POST, PUT, PATCH, DELETE",
  credentials: true,
};

import petRouter from "./routes/PetRouter.js";
import adopterRouter from "./routes/UserRouter.js";
import authMiddleWare from "./middleware/authMiddleware.js";
import authGoogle from "./routes/authRouter.js";
import adoptionAppRouter from "./routes/adoptionAppRouter.js";
import notificationRouter from "./routes/notificationRouter.js";

app.use(cors(corsOption));
app.use(express.json());

app.use("/api/auth", authGoogle);

app.use(authMiddleWare);
app.use("/api/user", adopterRouter);
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
