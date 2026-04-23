const socketController = {
  setConfig: (io) => {
    io.on("connection", (socket) => {
      console.log("A user has connected with socket: ", socket.id);

      socket.on("setup", (userId) => {
        socket.join(userId);
        console.log(`User has initialized with their global room: ${userId}`);
      });
      socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
        console.log(
          `User ${socket.id} has joined converstaion ${conversationId}`,
        );
      });
      socket.on("leave_chat", (conversationId) => {
        socket.leave(conversationId);
        console.log(
          `User ${socket.id} has left converstaion ${conversationId}`,
        );
      });
      socket.on("disconnect", () => {
        console.log("User with socketID: ", socket.id, " has disconnected");
      });
    });
  },
};

export default socketController;
