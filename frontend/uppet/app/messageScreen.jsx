import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../context/SocketContext";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { useChats } from "../context/ChatContext";
import { api } from "../api/axios";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import * as Themes from "../assets/themes/themes";

export default function messageScreen() {
  const router = useRoute();

  const { user } = useUser();
  const socket = useSocket();
  const { receiverID } = router.params;
  const [chatThreadOrigin, setChatThreadOrigin] = useState(
    router.params.chatThreadOrigin,
  );
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [msgMedia, setMsgMedia] = useState(null);

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false)

  const roomID = [user._id, receiverID].sort().join("_");
  console.log("Receiver ID is ", receiverID);
  console.log("Chat Thread Origin in Message Screen", chatThreadOrigin);
  // const { chatThreadOrigin, receiver } = router.params;

  // const messageData = {
  //   roomID: roomID,
  //   sender: user._id,
  //   receiver: receiverID,
  //   chatThreadOrigin: //idk about this essentially
  //   body: text,
  //   // media: //
  // }
  // socket.emit("send_message", messageData)

  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", roomID);
    socket.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);

      socket.emit("message_delivered", { messageID: newMessage._id });
    });

    return () => {
      socket.emit("leave_chat", roomID);
      socket.off("receive_message");
    };
  }, [socket]);

  useEffect(() =>{
    if(!chatThreadOrigin) return
    fetchMessages(1);
  }, [])
  
  const fetchMessages = async (pageNum, isRefreshing = false) => {
    console.log("I tried to fetch messages")
    try{
      setLoading(true);
      const res = await api.get(`/api/message/${chatThreadOrigin._id}`, {
        page: pageNum
      })
      const moreMessages = res.data.body;
      setMessages((prev) => {
        if(isRefreshing) return moreMessages
        else return [...prev, ...moreMessages]
      })
      console.log("Messages here", moreMessages)
      if(moreMessages.length < 10){
        setHasMore(false)
      }

    }catch (err) {
      console.log("Error Fetching Previous Messages", err.message);
    } finally{
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchMessages(page + 1);
      setPage((prev) => prev + 1);
    }
  };
 const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchMessages(1, true);
  }, []);

  const mediaSelection = () => {
    console.log("Puttin Empty media for handling later");
  };

  const onPress = () => {
    console.log("Message Bubble HAS BEEN PRESSED");
  };

  const renderMessages = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.messageBubble,
          item.sender === user._id
            ? styles.senderMessage
            : styles.receiverMessage,
        ]}
      >
        <Text style={styles.messageText}> {item.body}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </TouchableOpacity>
    );
  };

  const handleChangeInputText = (text) => {
    setTextInput(text);
  };

  const handleSend = async () => {
    let dbChatThread = chatThreadOrigin;

    if (!chatThreadOrigin) {
      try {
        const res = await api.post(`api/chatlist/make`, {
          members: [user._id, receiverID],
        });
        dbChatThread = res.data.body;
        setChatThreadOrigin(dbChatThread);
        console.log("Chat Thread has been initialized", dbChatThread);
      } catch (err) {
        console.log("Error in making chatlist", err.message);
      }
    }

    const tempMessage = {
      _id: `temp-${Date.now()}`,
      body: textInput,
      media: msgMedia,
      sender: user._id,
      timestamp: new Date().toISOString(),
      status: "pending",
      roomID: roomID,
      chatThreadOrigin: dbChatThread,
      receiverID: receiverID,
    };

    socket.emit("send_message", tempMessage);
    setMessages((prev) => [...prev, tempMessage]);
    setTextInput("")
    setMsgMedia("")
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FlatList
        data={messages}
        renderItem={renderMessages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.flatListContents}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Start a conversation</Text>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <TextInput
              style={styles.inputTextArea}
              value={textInput}
              placeholderTextColor={"black"}
              onChangeText={handleChangeInputText}
              placeholder="Enter Message"
            ></TextInput>
            <TouchableOpacity onPress={handleSend}>
              <Text>PRESS ME!</Text>
            </TouchableOpacity>
          </View>
        }
      ></FlatList>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flatListContainer: {
    flex: 1,
  },
  flatListContents: {
    padding: Themes.SPACING.md,
    backgroundColor: Themes.COLORS.background,
    flexGrow: 1,
  },
  messageBubble: {
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    marginVertical: Themes.SPACING.xs,
  },
  messageText: {
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.body,
    fontSize: Themes.TYPOGRAPHY.fontSize,
  },
  senderMessage: {
    backgroundColor: Themes.COLORS.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  receiverMessage: {
    backgroundColor: "#E5E5EA",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  footerContainer: {
    flexDirection: "row",
    padding: Themes.SPACING.sm,
    alignItems: "center",
  },
  inputTextArea: {
    borderRadius: Themes.RADIUS.pill,
    flex: 1,
    borderWidth: 2,
    borderColor: "black",
  },
  emptyText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textFaded || "#888",
    textAlign: "center",
    marginTop: 100, // Pushes it down so it's not hugging the top
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 4,
    alignSelf: "flex-end", // Keeps the time tucked in the corner
  },
});

// try {
//   // const messageRes = await api.post(`/api/message/send`, {
//   //   chatThreadOrigin: chatThreadOrigin._id,
//   //   receiver: receiverID,
//   //   sender: user._id,
//   //   body: text,
//   // });
//   // setMessages((prev) =>
//   //   prev.map((msg) =>
//   //     msg._id === tempMessage._id
//   //       ? { ...messageRes.data.body, status: "sent" }
//   //       : msg,
//   //   ),
//   // );
// } catch (err) {
//   console.log("ERROR IN SENDING MESSAGE");
//   setMessages((prev) =>
//     prev.map((msg) =>
//       msg._id === tempMessage._id
//         ? { ...messageRes.data.body, status: "failed" }
//         : msg,
//     ),
//   );
// } finally {
//   setTextInput("");
//   setMsgMedia("");
// }
