import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

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
  ActivityIndicator,
  Dimensions
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';



export default function messageScreen() {
  const initialLimit = Math.ceil(Dimensions.get('window').height / Themes.TYPOGRAPHY.badgeText.fontSize);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
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

  const [loading, setLoading] = useState(false);
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
      // Ignore messages sent by the current user since we handle them optimistically
      if (newMessage.sender === user._id) return;

      setMessages((prevMessages) => {
        // Prevent duplicate keys if the message already exists
        if (prevMessages.some((msg) => msg._id === newMessage._id)) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
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
    });

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
      console.log("Message Receipt Received", messageID, updatedThreadOrigin, status);
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
    isFetchingRef.current = true;
    setLoading(true);
    try{
      const limit = messages.length > 0 ? 15 : initialLimit;
      const res = await api.get(`/api/message/${chatThreadOrigin._id}`, {
        params: { lastMessageId: lastMessageId, limit: limit },
      })
      const moreMessages = res.data.body || [];
      setMessages((prev) => {
        if(isRefreshing) return moreMessages
        return [...prev, ...moreMessages]
      })
      if(moreMessages.length < limit){
        setHasMore(false)
      }
      if(moreMessages.length > 0){
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
          <Text style={styles.timestamp}>{item.updatedAt}</Text>
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

    

    try {
      setMessages((prev) => [tempMessage, ...prev]);
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
      >
      <FlatList
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={messages}
        renderItem={renderMessages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.flatListContents}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        bounces={true}
        overScrollMode="always"
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
      
      <View style={[styles.footerContainer,{ paddingBottom: Platform.OS === 'ios' ? insets.bottom : Themes.SPACING.sm }]}>
        <TouchableOpacity onPress={mediaSelection} style={styles.iconButton}>
          <MaterialCommunityIcons name="image" size={28} color="#8E8E93" />
        </TouchableOpacity>
        <TextInput
          style={styles.inputTextArea}
          value={textInput}
          placeholderTextColor="#8E8E93"
          onChangeText={handleChangeInputText}
          placeholder="Message..."
          multiline
        />
        <TouchableOpacity 
          onPress={handleSend} 
          style={[styles.sendButton, !textInput.trim() && { opacity: 0.5 }]} 
          disabled={!textInput.trim()}
        >
          <MaterialCommunityIcons name="send" size={20} color="white" style={{ marginLeft: 2 }} />
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
    flexGrow: 1,
    padding: Themes.SPACING.sm,
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
  paddingHorizontal: Themes.SPACING.md,
  paddingTop: Themes.SPACING.sm,        // ← top only
  alignItems: "center",
  backgroundColor: Themes.COLORS.background,
  borderTopWidth: 1,
  borderTopColor: "#E5E5EA",
  },
  inputTextArea: {
    borderRadius: 20,
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginHorizontal: Themes.SPACING.sm,
    fontSize: 16,
    maxHeight: 100,
  },
  iconButton: {
    padding: Themes.SPACING.xs,
  },
  sendButton: {
    backgroundColor: Themes.COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Themes.SPACING.xs,
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

