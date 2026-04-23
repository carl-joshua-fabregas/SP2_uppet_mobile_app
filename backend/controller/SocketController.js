const socketController = {
  setConfig: (io) => {
    io.on("connection", (socket) => {
      console.log("A user has connected with socket: ", socket.id);

      socket.on("setup", (userId) => {
        socket.join(userId);
        console.log(`User has initialized with their global room: ${userId}`);
      });
      socket.on("send_message", (data) => {
        console.log(
          `Messaged Sent by ${data.senderID} using socket`,
          socket.id,
        );
        socket.to(data.roomID).emit("receive_message", data); //Im not sure if data was the right one here
      });
      socket.on("join_chat", (roomID) => {
        socket.join(roomID);
        console.log(`User ${socket.id} has joined converstaion ${roomID}`);
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
