import jwt from "jsonwebtoken";

export default async function socketMiddleware(socket, next) {
  console.log("--------IN SOCKET MIDDLEWARE ----------------");

  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("-----------Socket Authentication Error-------"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (err) {
    console.error("Socket Authentication Error with message: ", err.message);
    return next(new Error("Authentication Error with message: ", err.message));
  }
}
