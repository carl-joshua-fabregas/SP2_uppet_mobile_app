import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import * as ImagePicker from "expo-image-picker";
import ImageView from "react-native-image-viewing";
import ViewMessageCard from "../component/viewMessageCard";
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
  Modal,
  Animated,
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

export default function MessageScreen() {
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.badgeText.fontSize,
  );
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedMessageID, setSelectedMessageID] = useState(null);

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight() || 0;
  const router = useRoute();
  const isFetchingRef = useRef(false);
  const isSending = useRef(false);
  const { user } = useUser();
  const socket = useSocket();
  const { receiverID } = router.params;
  console.log(
    "Receiver ID in message screen:",
    receiverID,
    "receiverName:",
    router.params.receiverName,
  );
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
  const [selectedMessageOptions, setSelectedMessageOptions] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const messageRef = useRef(messages);

  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isButtonVisible = useRef(false);
  const screenHeight = Dimensions.get("window").height;

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > screenHeight;
    if (shouldShow && !isButtonVisible.current) {
      isButtonVisible.current = true;
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && isButtonVisible.current) {
      isButtonVisible.current = false;
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const [editingMessage, setEditingMessage] = useState(null);

  const roomID = [user._id, receiverID].sort().join("_");

  const formatSectionTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeOptions = { hour: "numeric", minute: "2-digit" };
    const timeString = date.toLocaleTimeString([], timeOptions);

    if (isToday) return `Today, ${timeString}`;
    if (isYesterday) return `Yesterday, ${timeString}`;

    return `${date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}, ${timeString}`;
  };

  const handleToggleMessageSelect = (id) => {
    setSelectedMessageID((prevID) => (prevID === id ? null : id));
  };

  const handlePressImage = (media) => {
    setSelectedImage(media);
    setShowImageViewer(true);
  };

  const handleOpenOptions = (message) => {
    console.log("MODAAAL 0, ", message, user._id);
    if (message.sender !== user._id) return;
    setSelectedMessageOptions(message);
    setIsModalVisible(true);
  };

  const handleEditAction = () => {
    if (selectedMessageOptions) {
      setEditingMessage(selectedMessageOptions);
      setTextInput(selectedMessageOptions.body || ""); // Populate input
    }
    setIsModalVisible(false);
  };

  // NEW ACTION: Cancel Edit
  const cancelEdit = () => {
    setEditingMessage(null);
    // Notice we do NOT clear textInput here as per your requirements
  };

  // NEW ACTION: Handle Delete
  const handleDeleteAction = async () => {
    if (!selectedMessageOptions) return;
    if (selectedMessageOptions.media !== null) {
      try {
        const presignedUrl = await api.post(`/api/message/presignDeleteURL`, {
          key: selectedMessageOptions.media.key,
        });
        const { url } = presignedUrl.data.body;
        const aws3res = await fetch(url, {
          method: "DELETE",
        });
        console.log("Did we delete the media from S3?", aws3res.ok);
      } catch (err) {
        console.log("Error deleting media from S3:", err.message);
      }
    }
    try {
      await api.delete(`/api/message/delete/${selectedMessageOptions._id}`);
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== selectedMessageOptions._id),
      );
    } catch (err) {
      console.log("Error deleting message:", err.message);
    } finally {
      setIsModalVisible(false);
    }
  };
  useEffect(() => {
    messageRef.current = messages;
  }, [messages]);
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_chat", roomID);

    if (chatThreadOrigin) {
      socket.emit("messages_read", {
        chatThreadOrigin: chatThreadOrigin._id || chatThreadOrigin,
        receiverId: user._id,
        roomID,
      });
    }
    socket.on("message_deleted", (data) => {
      const deletedMessageId = data.deletedID;

      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedMessageId),
      );
    });

    socket.on("receive_message", (newMessage) => {
      if (newMessage.sender === user._id) return;

      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg._id === newMessage._id)) {
          return prevMessages;
        }
        return [newMessage, ...prevMessages];
      });

      socket.emit("message_delivered", { messageID: newMessage._id, roomID });

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
            if (messageID && msg._id === messageID) {
              return { ...msg, status };
            }
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
      },
    );
    socket.on("message_updated", (data) => {
      const isInArray = messageRef.current.some(
        (msg) => msg._id === data.updmessage._id,
      );
      if (isInArray) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.updmessage._id ? data.updmessage : m,
          ),
        );
      }
    });

    return () => {
      socket.emit("leave_chat", roomID);
      socket.off("receive_message");
      socket.off("message_receipt");
      socket.off("message_updated");
      socket.off("message_deleted");
    };
  }, [socket, chatThreadOrigin]);

  useEffect(() => {
    const initialMount = async () => {
      let thread = chatThreadOrigin;
      if (!chatThreadOrigin) {
        try {
          const res = await api.get(`/api/chatlist/get/${receiverID}`);
          if (res.data.body) {
            setChatThreadOrigin(res.data.body);
            thread = res.data.body;
          } else {
            return;
          }
        } catch (err) {
          console.log("No existing thread found. Waiting for first message.");
          setLoading(false);
          return;
        }
      }

      await fetchMessages(thread, null, false);
    };

    initialMount();

    navigation.setOptions({
      headerTitle: `${router.params.receiverName || "User"}`,
    });
  }, []);

  const fetchMessages = async (thread, lastMessageId, isRefreshing = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const limit = messages.length > 0 ? 15 : initialLimit;
      const res = await api.get(`/api/message/${thread._id}`, {
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
      await fetchMessages(chatThreadOrigin, cursorID);
    }
    return;
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setCursorID(null);
    await fetchMessages(chatThreadOrigin, null, true);
  }, [chatThreadOrigin]);

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
            type: asset.mimeType,
            index: index,
            fileSize: asset.fileSize,
            fileName: asset.fileName,
          };
        });

        const uploadedMedia = await Promise.all(
          selectedMedia.map(async (media, index) => {
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
              headers: {
                "Content-Type": media.type,
              },
            });
            const uploadetails = {
              key: key,
              url: finalUrl,
              type: media.type,
            };
            const body = index === 0 && textInput ? textInput : " ";
            handleSend(body, uploadetails, true);
            return true;
          }),
        );
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

  const renderMessages = ({ item, index }) => {
    const isSender = item.sender === user._id;
    const olderMessage = messages[index + 1];
    let showTimeHeader = false;

    if (!olderMessage) {
      showTimeHeader = true;
    } else {
      const currTime = new Date(item.updatedAt || item.timestamp).getTime();
      const olderTime = new Date(
        olderMessage.updatedAt || olderMessage.timestamp,
      ).getTime();

      if (currTime - olderTime > 60 * 60 * 1000) {
        showTimeHeader = true;
      }
    }

    return (
      <View>
        {showTimeHeader && (
          <View style={styles.timeHeaderContainer}>
            <Text style={styles.timeHeaderText}>
              {formatSectionTime(item.updatedAt || item.timestamp)}
            </Text>
          </View>
        )}

        <ViewMessageCard
          message={item}
          isSender={isSender}
          isSelected={selectedMessageID === item._id}
          onToggleSelect={handleToggleMessageSelect}
          onPressImage={handlePressImage}
          onOpenOptions={handleOpenOptions}
        />
      </View>
    );
  };

  const handleChangeInputText = (text) => {
    setTextInput(text);
  };

  const handleSend = async (body, media, isBatch = false) => {
    if (!isBatch && isSending.current === true) return;
    if (!isBatch) isSending.current = true;
    if (editingMessage) {
      try {
        const res = await api.patch(`/api/message/edit/${editingMessage._id}`, {
          body,
          media,
          receiver: receiverID,
          sender: user._id,
        });
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === editingMessage._id ? { ...msg, body: body } : msg,
          ),
        );
      } catch (err) {
        console.log("ERROR IN EDITING MESSAGE", err.message);
      } finally {
        // After successful edit, reset state
        setEditingMessage(null);
        setTextInput("");
        isSending.current = false;
      }
      return;
    }

    // Normal Send Logic
    let dbChatThread = chatThreadOrigin;

    if (!chatThreadOrigin) {
      try {
        const res = await api.post(`api/chatlist/make`, {
          members: [user._id, receiverID],
        });
        dbChatThread = res.data.body;
        setChatThreadOrigin(dbChatThread);
      } catch (err) {
        console.log("Error in making chatlist", err.message);
      }
    }

    const tempMessage = {
      _id: `temp-${Math.random().toString(36).substr(2, 9)}`,
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
      isSending.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <FlatList
        ref={flatListRef} // 👈 Add ref
        onScroll={handleScroll} // 👈 Add scroll listener
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        data={messages}
        renderItem={renderMessages}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : index.toString()
        }
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

      {/* NEW: Edit Message Indicator */}
      {editingMessage && (
        <View style={styles.editIndicatorContainer}>
          <View style={styles.editIndicatorLeft}>
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.editIndicatorText}>Editing message</Text>
          </View>
          <TouchableOpacity
            onPress={cancelEdit}
            style={styles.editIndicatorClose}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={Themes.COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      )}
      <Animated.View
        style={[
          styles.floatingButtonContainer,
          {
            opacity: fadeAnim,
            bottom: Platform.OS === "ios" ? insets.bottom + 80 : 80,
          },
        ]}
        pointerEvents={isButtonVisible.current ? "auto" : "none"} // Prevents invisible clicks
      >
        <TouchableOpacity
          onPress={scrollToBottom}
          style={styles.floatingButton}
        >
          <MaterialCommunityIcons name="chevron-down" size={30} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
      <View
        style={[
          styles.footerContainer,
          {
            paddingBottom:
              Platform.OS === "ios" ? insets.bottom : Themes.SPACING.sm,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMediaPicker()}
          style={styles.iconButton}
        >
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
          onPress={() => handleSend(textInput, msgMedia)}
          style={[styles.sendButton, !textInput.trim() && { opacity: 0.5 }]}
          disabled={!textInput.trim() || isSending.current}
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

      {/* NEW: Message Options Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {!selectedMessageOptions?.media && (
              <TouchableOpacity
                onPress={handleEditAction}
                style={styles.modalOption}
              >
                <Text style={styles.modalOptionText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDeleteAction}
              style={[styles.modalOption, styles.modalOptionNoBorder]}
            >
              <Text style={[styles.modalOptionText, { color: "#FF3B30" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flatListContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
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
    paddingTop: Themes.SPACING.sm,
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
    marginTop: 100,
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    color: "#8E8E93",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  viewerHeaderContainer: {
    width: "100%",
    position: "absolute",
    zIndex: 1,
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
    backgroundColor: "#000",
  },
  timeHeaderContainer: {
    alignItems: "center",
    marginVertical: Themes.SPACING.md,
  },
  timeHeaderText: {
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textMuted,
    backgroundColor: Themes.COLORS.badge,
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: 4,
    borderRadius: Themes.RADIUS.pill,
    overflow: "hidden",
  },

  // NEW STYLES: Modal Elements
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Themes.COLORS.card,
    width: "70%",
    borderRadius: Themes.RADIUS.md,
    overflow: "hidden",
  },
  modalOption: {
    paddingVertical: Themes.SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalOptionNoBorder: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textDark,
    textAlign: "center",
  },

  // NEW STYLES: Edit Indicator
  editIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Themes.COLORS.soft,
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  editIndicatorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editIndicatorText: {
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textDark,
  },
  editIndicatorClose: {
    padding: Themes.SPACING.xs,
  },
  floatingButtonContainer: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
  floatingButton: {
    backgroundColor: Themes.COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
