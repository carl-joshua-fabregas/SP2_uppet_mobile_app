import {
  saveMessageToDb,
  setMessageStatusToDeliver,
} from "../services/messageServices.js";

const socketController = {
  setConfig: (io) => {
    io.on("connection", (socket) => {
      console.log("A user has connected with socket: ", socket.id);

      socket.on("setup", (userId) => {
        socket.join(userId);
        console.log(`User has initialized with their global room: ${userId}`);
      });
      socket.on("send_message", async (data) => {
        try {
          console.log(
            `Messaged Sent by ${data.senderID} using socket`,
            socket.id,
          );
          const { newMessage, updatedChatList } = await saveMessageToDb(data);
          socket.to(data.roomID).emit("receive_message", newMessage);
          socket.to(data.receiverID).emit("update_chatlist", updatedChatList);
          console.log(
            "HERE ARE THE MESSAGES AND UPDATED LIST BADING",
            newMessage,
          );
          console.log(updatedChatList);
        } catch (err) {
          socket.emit("message_error", { err: err.messgae });
        }
      });

      socket.on("join_chat", (roomID) => {
        socket.join(roomID);
        console.log(`User ${socket.id} has joined converstaion ${roomID}`);
      });
      socket.on("message_delivered", async (messageData) => {
        try {
          const { updateMessages } =
            await setMessageStatusToDeliver(messageData);
          console.log(updateMessages);
        } catch (err) {
          console.log("Error in setting status to delivered", err.message);
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
