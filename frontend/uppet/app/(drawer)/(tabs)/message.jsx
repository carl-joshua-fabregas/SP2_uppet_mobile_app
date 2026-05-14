import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../../api/axios";
import * as Themes from "../../../assets/themes/themes";
import { useSocket } from "../../../context/SocketContext";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../../context/UserContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatList() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [chatlist, setChatlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const socket = useSocket();
  const { user } = useUser();
  const [cursorUpdatedAt, setCursorUpdatedAt] = useState(null);
  const [cursorId, setCursorId] = useState(null);
  const isFetchingRef = useRef(false);
  const fetchChatList = async (
    currentCursorDate = null,
    currentCursorId = null,
    isRefreshing = false,
  ) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      const res = await api.get("/api/chatlist/get", {
        params: {
          limit: 10,
          cursorUpdatedAt: currentCursorDate,
          cursorId: currentCursorId,
        },
      });

      const newChatList = res?.data?.body || [];

      if (newChatList.length < 10) {
        setHasMore(false);
      }

      if (newChatList.length > 0) {
        const lastItem = newChatList[newChatList.length - 1];
        setCursorUpdatedAt(lastItem.updatedAt);
        setCursorId(lastItem._id);
      }

      setChatlist((prev) => {
        if (isRefreshing) return newChatList;

        // Filter out duplicates (the fix from the previous step)
        const uniqueNewChats = newChatList.filter(
          (newChat) =>
            !prev.some((existingChat) => existingChat._id === newChat._id),
        );

        return [...prev, ...uniqueNewChats];
      });
    } catch (err) {
      console.log("Error fetching chatlist:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false; // ADD THIS to unlock the fetch
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setCursorUpdatedAt(null); // Reset cursor on refresh
    setCursorId(null); // Reset cursor on refresh
    await fetchChatList(null, null, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchChatList(cursorUpdatedAt, cursorId);
    }
  };

  useEffect(() => {
    fetchChatList(null, null);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("update_chatlist", (updatedConversation) => {
      setChatlist((prevChats) => {
        const chatIndexLoc = prevChats.findIndex(
          (chat) => chat._id === updatedConversation._id,
        );
        const updatedChats = [...prevChats];

        if (chatIndexLoc !== -1) {
          updatedChats[chatIndexLoc] = updatedConversation;
          const [moveChat] = updatedChats.splice(chatIndexLoc, 1);
          updatedChats.unshift(moveChat);
        } else {
          updatedChats.unshift(updatedConversation);
        }
        return updatedChats;
      });
    });

    return () => socket.off("update_chatlist");
  }, [socket]);

  const renderLastMessage = (lastMessage) => {
    if (!lastMessage) return "No messages yet";

    if (lastMessage.media) {
      return `Sent ${lastMessage.media.type || "media"}`;
    }

    return lastMessage.body || "No messages yet";
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const renderItem = ({ item }) => {
    const isUnread =
      item.lastMessage?.sender !== user._id &&
      item.lastMessage?.status !== "read";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate("messageScreen", {
            chatThreadOrigin: item,
            receiverID: item.members[0]?._id,
            receiverName: `${item.members[0]?.firstName} ${item.members[0]?.middleName || ""} ${item.members[0]?.lastName}`,
          });
        }}
      >
        <Image
          source={{ uri: item.members[0]?.profilePhoto?.url }}
          style={styles.avatar}
        />

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                Themes.TYPOGRAPHY.subsubheading,
                isUnread && styles.textUnread,
                styles.nameText,
              ]}
              numberOfLines={1}
            >
              {item.members[0]?.firstName} {item.members[0]?.middleName}{" "}
              {item.members[0]?.lastName}
            </Text>

            <Text style={styles.timestamp}>
              {formatMessageTime(item.lastMessage?.createdAt || item.updatedAt)}
            </Text>
          </View>

          <Text
            style={[
              Themes.TYPOGRAPHY.body,
              isUnread ? styles.bodyUnread : styles.bodyRead,
            ]}
            numberOfLines={1}
          >
            {renderLastMessage(item.lastMessage)}
          </Text>
        </View>

        {isUnread && <View style={styles.unreadBadge} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatlist}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 50 + insets.bottom },
        ]}
        ListEmptyComponent={<Text style={styles.emptyText}>Chat is Empty</Text>}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color={Themes.COLORS.primary} />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Themes.COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    padding: Themes.SPACING.sm,
    paddingBottom: 50,
  },
  card: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.card,
    padding: Themes.SPACING.md,

    borderBottomWidth: 1, // Added a subtle line so flush cards don't merge visually
    borderBottomColor: Themes.COLORS.soft,
    alignItems: "center",
  },
  avatar: {
    width: 48, // Sized down slightly from 50 to feel less cramped
    height: 48,
    borderRadius: Themes.RADIUS.pill,
    backgroundColor: Themes.COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Themes.SPACING.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  nameText: {
    flex: 1,
    marginRight: Themes.SPACING.sm,
  },
  textUnread: {
    fontFamily: "Fredoka-SemiBold",
    color: Themes.COLORS.textDark,
  },
  timestamp: {
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.textMuted,
  },
  bodyRead: {
    color: Themes.COLORS.textMuted,
  },
  bodyUnread: {
    color: Themes.COLORS.textDark,
    fontFamily: "Fredoka-Medium",
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Themes.COLORS.primary,
    marginLeft: Themes.SPACING.sm,
  },
  emptyText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textMuted,
    textAlign: "center",
    marginTop: 100,
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
});
