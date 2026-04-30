import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useRoute } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import * as ImagePicker from "expo-image-picker";
import ImageView from "react-native-image-viewing";
import { useVideoPlayer, VideoView } from "expo-video";
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
  Dimensions,
  Image,
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

export default function messageScreen() {
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.badgeText.fontSize,
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight() || 0;
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
  const [refreshing, setRefreshing] = useState(false);

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
        roomID,
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
          roomID,
        });
      }
    });

    socket.on(
      "message_receipt",
      ({ messageID, chatThreadOrigin: updatedThreadOrigin, status }) => {
        setMessages((prev) =>
          prev.map((msg) => {
            // If a specific message was delivered
            if (messageID && msg._id === messageID) {
              return { ...msg, status };
            }
            // If the whole thread was read
            if (
              updatedThreadOrigin &&
              msg.status !== "read" &&
              msg.sender === user._id
            ) {
              return { ...msg, status };
            }
            return msg;
          }),
        );
        console.log(
          "Message Receipt Received",
          messageID,
          updatedThreadOrigin,
          status,
        );
      },
    );

    return () => {
      socket.emit("leave_chat", roomID);
      socket.off("receive_message");
      socket.off("message_receipt");
    };
  }, [socket]);

  useEffect(() => {
    if (!chatThreadOrigin) return;
    const initialMount = async () => {
      await fetchMessages(null, false);
    };
    initialMount();
  }, []);

  const fetchMessages = async (lastMessageId, isRefreshing = false) => {
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const limit = messages.length > 0 ? 15 : initialLimit;
      const res = await api.get(`/api/message/${chatThreadOrigin._id}`, {
        params: { lastMessageId: lastMessageId, limit: limit },
      });
      const moreMessages = res.data.body || [];
      setMessages((prev) => {
        if (isRefreshing) return moreMessages;
        return [...prev, ...moreMessages];
      });
      if (moreMessages.length < limit) {
        setHasMore(false);
      }
      if (moreMessages.length > 0) {
        setCursorID(moreMessages[moreMessages.length - 1]._id);
      }
    } catch (err) {
      console.log("Error Fetching Previous Messages", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  const handleLoadMore = async () => {
    if (!loading && hasMore && !isFetchingRef.current) {
      await fetchMessages(cursorID);
    }
    return;
  };
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setCursorID(null);
    await fetchMessages(null, true);
  }, []);

  const handleMediaPicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        console.log("Permission Denied");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 1,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const selectedMedia = result.assets.map((asset, index) => {
          return {
            key: asset.fileName + asset.fileSize,
            url: asset.uri,
            type: asset.type,
            index: index,
            fileSize: asset.fileSize,
            fileName: asset.fileName,
          };
        });

        console.log(selectedMedia);
        const uploadedMedia = await Promise.all(
          selectedMedia.map(async (media) => {
            const presignedURL = await api.post(
              `/api/message/presignUploadURL`,
              {
                fileSize: media.fileSize,
                fileType: media.type,
                fileName: media.fileName,
              },
            );

            const { url, key, finalUrl } = presignedURL.data.body;

            const fetchMedia = await fetch(media.url);
            const blob = await fetchMedia.blob();

            await fetch(url, {
              method: "PUT",
              body: blob,
              contentType: media.type,
            });
            const uploadetails = {
              key: key,
              url: finalUrl,
              type: media.type,
            };
            const body = textInput ? textInput : " ";
            handleSend(body, uploadetails);
            return true;
          }),
        );

        console.log("here are the images", result.assets);
      } else {
        console.log("The user has cancelled the image library");
      }
    } catch (err) {
      console.error("Error picking media:", err);
    }
  };

  const onPress = (item) => {
    const itemMedia = item.media?.type === "image";
    if (itemMedia) {
      setSelectedImage(item.media);
      setShowImageViewer(true);
    }
  };
  const VideoMessageBubble = ({ videoUrl }) => {
    const player = useVideoPlayer(videoUrl, (player) => {
      player.loop = false;
      player.pause();
    });
    return (
      <VideoView
        player={player}
        style={styles.videoBubble}
        allowsFullscreen // Gives the user a native full-screen button
        allowsPictureInPicture
        nativeControls={true}
      ></VideoView>
    );
  };
  const renderMessages = ({ item }) => {
    const isSender = item.sender === user._id;
    const itemMedia = item.media?.type === "image";
    const itemVideo = item.media?.type === "video";

    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        style={[
          styles.messageBubble,
          isSender ? styles.senderMessage : styles.receiverMessage,
        ]}
      >
        {/* Conditionally render Image or Text body */}
        {itemMedia ? (
          // TODO: Add your Image component here
          <Image
            key={item.media.key}
            source={{ uri: item.media.url }}
            style={{ height: 200, width: 200 }}
            resizeMode="cover"
          ></Image>
        ) : (
          <Text style={styles.messageText}>{item.body}</Text>
        )}
        {itemVideo && (
          <VideoMessageBubble videoUrl={item.media.url}></VideoMessageBubble>
        )}

        {/* Timestamp and Read Receipts (Renders for both text and media) */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            marginTop: 4, // Added a small margin for spacing
          }}
        >
          <Text style={styles.timestamp}>{item.updatedAt}</Text>

          {isSender && (
            <View style={{ marginLeft: 5 }}>
              {item.status === "pending" && (
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#8E8E93"
                />
              )}
              {item.status === "sent" && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color="#8E8E93"
                />
              )}
              {item.status === "delivered" && (
                <MaterialCommunityIcons
                  name="check-all"
                  size={16}
                  color="#8E8E93"
                />
              )}
              {item.status === "read" && (
                <MaterialCommunityIcons
                  name="check-all"
                  size={16}
                  color="#34B7F1"
                />
              )}
              {item.status === "failed" && (
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={16}
                  color="red"
                />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleChangeInputText = (text) => {
    setTextInput(text);
  };

  const handleSend = async (body, media) => {
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
      body: body,
      media: media,
      sender: user._id,
      timestamp: new Date().toISOString(),
      status: "pending",
      roomID: roomID,
      chatThreadOrigin: dbChatThread,
      receiverID: receiverID,
    };

    try {
      setMessages((prev) => [tempMessage, ...prev]);
      console.log("message media is", media);
      const messageRes = await api.post(`/api/message/send`, {
        chatThreadOrigin: dbChatThread._id || dbChatThread,
        receiver: receiverID,
        sender: user._id,
        body: body,
        media: media,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...messageRes.data.body, status: "sent" }
            : msg,
        ),
      );
    } catch (err) {
      console.log("ERROR IN SENDING MESSAGE", err.message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...tempMessage, status: "failed" }
            : msg,
        ),
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
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="black" />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
        inverted
      ></FlatList>

      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom:
              Platform.OS === "ios" ? insets.bottom : Themes.SPACING.sm,
          },
        ]}
      >
        <TouchableOpacity onPress={handleMediaPicker} style={styles.iconButton}>
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
          <MaterialCommunityIcons
            name="send"
            size={20}
            color="white"
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
      </View>
      <ImageView
        images={selectedImage ? [{ uri: selectedImage.url }] : []}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        // ✅ Add it directly inline like this:
        HeaderComponent={() => (
          <View
            style={[
              styles.viewerHeaderContainer,
              { marginTop: insets.top || 40 },
            ]}
          >
            <TouchableOpacity
              style={styles.customCloseButton}
              onPress={() => setShowImageViewer(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
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
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
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
    paddingTop: Themes.SPACING.sm, // ← top only
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
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
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
    justifyContent: "center",
    alignItems: "center",
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
  viewerHeaderContainer: {
    width: "100%",
    position: "absolute",
    zIndex: 1,
    // top: 40, <-- REMOVE THIS LINE
  },
  customCloseButton: {
    alignSelf: "flex-end",
    marginRight: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 20,
  },
  videoBubble: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000", // Black background while it loads
  },
});
