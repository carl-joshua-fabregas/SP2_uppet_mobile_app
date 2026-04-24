import { useEffect, useState, useCallback, useRef } from "react";
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
  RefreshControl,
  ActivityIndicator
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function messageScreen() {
  const router = useRoute();
  const isFetchingRef = useRef(false);
  const { user } = useUser();
  const socket = useSocket();
  const { receiverID } = router.params;
  const [chatThreadOrigin, setChatThreadOrigin] = useState(
    router.params.chatThreadOrigin,
  );
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [msgMedia, setMsgMedia] = useState(null);

  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursorID, setCursorID] = useState(null);
  const [refreshing, setRefreshing] = useState(false)

  const roomID = [user._id, receiverID].sort().join("_");
  // console.log("Receiver ID is ", receiverID);
  // console.log("Chat Thread Origin in Message Screen", chatThreadOrigin);
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

    // When the screen loads, mark all messages as read
    if (chatThreadOrigin) {
      socket.emit("messages_read", {
        chatThreadOrigin: chatThreadOrigin._id || chatThreadOrigin,
        receiverId: user._id,
        roomID
      });
    }

    socket.on("receive_message", (newMessage) => {

      setMessages((prevMessages) => {
        const exists = prevMessages.some((m) => m._id === newMessage._id)
        if(exists) return prevMessages
        
        return [newMessage, ...prevMessages]
      });

      // Emit delivered
      socket.emit("message_delivered", { messageID: newMessage._id, roomID });
      
      // Since we are actively on the screen, we also read it immediately
      if (chatThreadOrigin) {
        socket.emit("messages_read", {
          chatThreadOrigin: chatThreadOrigin._id || chatThreadOrigin,
          receiverId: user._id,
          roomID
        });
      }
    }
  );

    socket.on("message_receipt", ({ messageID, chatThreadOrigin: updatedThreadOrigin, status }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          // If a specific message was delivered
          if (messageID && msg._id === messageID) {
            return { ...msg, status };
          }
          // If the whole thread was read
          if (updatedThreadOrigin && msg.status !== "read" && msg.sender === user._id) {
            return { ...msg, status };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.emit("leave_chat", roomID);
      socket.off("receive_message");
      socket.off("message_receipt");
    };
  }, [socket]);

  useEffect(() =>{
    if(!chatThreadOrigin) return
    const initialMount = async () =>{
      await fetchMessages(null, false);
    }
    initialMount()
  }, [])
  
  const fetchMessages = async (lastMessageId, isRefreshing = false) => {
    console.log("I tried to fetch messages")
    isFetchingRef.current = true;
    setLoading(true);
    try{
      const res = await api.get(`/api/message/${chatThreadOrigin._id}`, {
        params: { lastMessageId: lastMessageId },
      })
      const moreMessages = res.data.body || [];
      console.log("More Messages", moreMessages)
      setMessages((prev) => {
        if(isRefreshing) return moreMessages
        return [...prev, ...moreMessages]
      })
      if(moreMessages.length < 10){
        console.log("DIIIIIIIIIID WE EVEREEEEER SSTTTTTOPP")
        setHasMore(false)
      }
      if(moreMessages.length > 0){
        console.log("================ MESSAGE IS ++++++++++++++++++++++", cursorID, moreMessages[moreMessages.length - 1]._id)
        setCursorID(moreMessages[moreMessages.length - 1]._id)
      }
    }catch (err) {
      console.log("Error Fetching Previous Messages", err.message);
    } finally{
      setLoading(false)
      setRefreshing(false)
      isFetchingRef.current = false;
    }
  }

  const handleLoadMore = async () => {
    if (!loading && hasMore && !isFetchingRef.current) {
      await fetchMessages(cursorID)
    }
    return
  };
 const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setCursorID(null)
    await fetchMessages(null, true);
  }, []);

  const mediaSelection = () => {
    console.log("Puttin Empty media for handling later");
  };

  const onPress = () => {
    console.log("Message Bubble HAS BEEN PRESSED");
  };

  const renderMessages = ({ item }) => {
    const isSender = item.sender === user._id;
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.messageBubble,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        <Text style={styles.messageText}> {item.body}</Text>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
          <Text style={styles.timestamp}>{item.timestamp || item.timeStamp}</Text>
          {isSender && (
            <View style={{ marginLeft: 5 }}>
              {item.status === "pending" && <MaterialCommunityIcons name="clock-outline" size={14} color="#8E8E93" />}
              {item.status === "sent" && <MaterialCommunityIcons name="check" size={16} color="#8E8E93" />}
              {item.status === "delivered" && <MaterialCommunityIcons name="check-all" size={16} color="#8E8E93" />}
              {item.status === "read" && <MaterialCommunityIcons name="check-all" size={16} color="#34B7F1" />}
              {item.status === "failed" && <MaterialCommunityIcons name="alert-circle-outline" size={16} color="red" />}
            </View>
          )}
        </View>
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

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      const messageRes = await api.post(`/api/message/send`, {
        chatThreadOrigin: dbChatThread._id || dbChatThread,
        receiver: receiverID,
        sender: user._id,
        body: textInput,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...messageRes.data.body, status: "sent" }
            : msg
        )
      );
    } catch (err) {
      console.log("ERROR IN SENDING MESSAGE", err.message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...tempMessage, status: "failed" }
            : msg
        )
      );
    } finally {
      setTextInput("");
      setMsgMedia(null);
    }
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
          loading && !refreshing ? <ActivityIndicator size="large" color="black" /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
        inverted
      ></FlatList>
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
    paddingBottom: 25,
    bottom: 25,
    flex: 1,
    backgroundColor: Themes.COLORS.background,
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

