import express from "express";
import cors from "cors";
import "dotenv/config";
import connectToDatabase from "./config/database.js";
import { socketConfig } from "./config/socket.js";
import petRouter from "./routes/PetRouter.js";
import adopterRouter from "./routes/UserRouter.js";
import authMiddleWare from "./middleware/authMiddleware.js";
import authGoogle from "./routes/authRouter.js";
import adoptionAppRouter from "./routes/adoptionAppRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import socketMiddleware from "./middleware/socketMiddleware.js";
import socketController from "./controller/SocketController.js";
import messageRouter from "./routes/messageRouter.js";
import chatThreadRouter from "./routes/chatThreadRouter.js";

const app = express();
const corsOption = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

//Setting Up THe Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("server is running on port " + PORT);
  const address = server.address();
  if (address) {
    console.log(
      "Server is accessible on " + address.address + ":" + address.port,
      address,
    );
  }
});
// Socket Configuration
const io = socketConfig.init(server, corsOption);
socketController.setConfig(io);
io.use(socketMiddleware);
app.set("io", io);

//Express Initial setuo
app.use(cors(corsOption));
app.use(express.json());

//Importing Routes - 1st is for verifying the google account
app.use("/api/auth", authGoogle);

//Other Route checkings are handled by auth MiddleWare
app.use(authMiddleWare);
app.use("/api/user", adopterRouter);
app.use("/api/pet", petRouter);
app.use("/api/adoptionApp", adoptionAppRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/message", messageRouter);
app.use("/api/chatlist", chatThreadRouter);
//Connecting To MONGODB ATLAS
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sp2_uppet";
connectToDatabase(MONGODB_URI);

//INITIAL TESTING
app.get("/", (req, res) => {
  res.send("Welcome to the SP2 Uppet Mobile App Backend!");
  console.log("Root endpoint accessed");
});
