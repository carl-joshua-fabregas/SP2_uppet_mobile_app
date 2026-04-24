import {
  setMessageStatusToDeliver,
  setMessageStatusToRead,
} from "../services/messageServices.js";

const socketController = {
  setConfig: (io) => {
    io.on("connection", (socket) => {
      console.log("A user has connected with socket: ", socket.id);

      socket.on("setup", (userId) => {
        socket.join(userId);
        console.log(`User has initialized with their global room: ${userId}`);
      });


      socket.on("join_chat", (roomID) => {
        socket.join(roomID);
        console.log(`User ${socket.id} has joined converstaion ${roomID}`);
      });
      socket.on("message_delivered", async (messageData) => {
        try {
          const { updateMessages } = await setMessageStatusToDeliver(messageData);
          if (updateMessages) {
            // Tell the sender that their message was delivered
            socket.to(messageData.roomID).emit("message_receipt", {
              messageID: updateMessages._id,
              status: "delivered"
            });
          }
        } catch (err) {
          console.log("Error in setting status to delivered", err.message);
        }
      });

      socket.on("messages_read", async (data) => {
        try {
          await setMessageStatusToRead(data.chatThreadOrigin, data.receiverId);
          // Tell the other person in the room that their messages were read
          socket.to(data.roomID).emit("message_receipt", {
            chatThreadOrigin: data.chatThreadOrigin,
            status: "read"
          });
        } catch (err) {
          console.log("Error in setting messages to read", err.message);
        }
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
