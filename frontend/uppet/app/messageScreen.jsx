import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { useChats } from "../context/ChatContext";
import { api } from "../api/axios";
import { View, FlatList } from "react-native";

export default function messageScreen() {
  const { user } = useUser();
  const { socket } = useSocket();
  const { updateInboxPreview } = useChats();
  const router = useRoute();
  const { chatThreadOrigin, receiver } = router.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", chatThreadOrigin._id);

    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [newMessage, ...prev]);
    });

    return () => {
      socket.emit("leave_chat", chatThreadOrigin._id);
      socket.off("receive_message");
    };
  }, [socket, chatThreadOrigin]);

  const handleMessage = async (text) => {
    // A temporay message so we can show if a message has been sent successfully or is still pending
    const tempMessage = {
      _id: `temp-${Date.now()}`,
      text: text,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    setMessages((prev) => [tempMessage, ...prev]);
    updateInboxPreview(chatThreadOrigin._id, tempMessage, receiver.firstName);

    try {
      const messageRes = await api.post(`/api/message/send`, {
        chatThreadOrigin: chatThreadOrigin._id,
        receiver: receiver._id,
        sender: user._id,
        body: text,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...messageRes.data.body, status: "sent" }
            : msg,
        ),
      );
    } catch (err) {
      console.log("ERROR IN SENDING MESSAGE");
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...messageRes.data.body, status: "failed" }
            : msg,
        ),
      );
    }
  };
  return <></>;
}
