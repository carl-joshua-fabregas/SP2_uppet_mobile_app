import { Server } from "socket.io";

let io;

export const socketConfig = {
  init: (httpServer, corsOption) => {
    io = new Server(httpServer, {
      corsOption,
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("SocketIO not initialized");
    }
    return io;
  },
};
