import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import NotificationCard from "../../../component/notificationCard";
import { api } from "../../../api/axios";
import * as Themes from "../../../assets/themes/themes";
import { useSocket } from "../../../context/SocketContext";

export default function Notification() {
  const socket = useSocket();

  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );
  const [notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursorID, setCursorID] = useState(null);
  const isFetchingRef = useRef(false);

  // --- Modal States ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedNotifId, setSelectedNotifId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotification = async (cursorID, isRefreshing = false) => {
    console.log(`HEY THIS IS THE PAGE FOR NOTIFICATION PAGE`);
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const limit = notification.length > 0 ? initialLimit : 10;
      const res = await api.get("/api/notification/notifications", {
        params: {
          cursorID: cursorID,
          limit: limit,
        },
      });
      const newNotification = res.data?.body;
      setNotification((prev) => {
        if (isRefreshing) return newNotification;
        else return [...prev, ...newNotification];
      });

      // Update cursor ID
      if (newNotification?.length > 0) {
        const lastNotification = newNotification[newNotification.length - 1];
        setCursorID(lastNotification._id);
      }

      // Check if we've reached the end
      if (newNotification?.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    setCursorID(null);
    await fetchNotification(null, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore && !isFetchingRef.current) {
      fetchNotification(cursorID);
    }
  };

  // Change your markIsRead function to this:
  const markIsRead = async (id) => {
    try {
      // 1. Pass the exact ID to the API
      await api.patch(`/api/notification/${id}`);

      // 2. Update the local state so the UI reacts instantly
      setNotification((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );
    } catch (err) {
      console.log("Error in mark is read", err.message);
    }
  };
  // --- Delete Handlers ---
  const handleLongPress = (id) => {
    setSelectedNotifId(id);
    setModalVisible(true);
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotifId) return;
    setIsDeleting(true);

    try {
      // Adjust the endpoint to match your actual backend delete route
      await api.delete(`/api/notification/${selectedNotifId}`);

      // Remove from UI
      setNotification((prev) =>
        prev.filter((item) => item._id !== selectedNotifId),
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsDeleting(false);
      setModalVisible(false);
      setSelectedNotifId(null);
    }
  };

  useEffect(() => {
    fetchNotification(null);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification_created", (data) => {
      console.log("New notifcation created with message", data.message);
      const isInArray = notification.some(
        (notif) => notif._id === data.notification._id,
      );
      if (!isInArray) {
        setNotification((prev) => [data.notification, ...prev]);
      }
    });

    socket.on("notification_deleted", (data) => {
      console.log("Notification is deleted with message", data.message);
      setNotification((prev) =>
        prev.filter((notif) => notif._id !== data.notification),
      );
    });
    return () => {
      socket.off("notification_created");
      socket.off("notification_deleted");
    };
  }, [socket]);

  return (
    <View style={{ flex: 1, backgroundColor: Themes.COLORS.background }}>
      <FlatList
        data={notification}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return (
            <NotificationCard
              notification={item}
              onLongPress={handleLongPress}
              markIsRead={markIsRead}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Notifications</Text>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color={Themes.COLORS.primaryDark}
              style={{ margin: 20 }}
            />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
      />

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Delete Notification?</Text>
            <Text style={styles.modalBody}>
              Are you sure you want to remove this notification?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDeleteNotification}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: Themes.COLORS.card,
    borderRadius: 12,
    padding: Themes.SPACING.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 18,
    color: Themes.COLORS.textDark,
    marginBottom: Themes.SPACING.sm,
  },
  modalBody: {
    ...Themes.TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: Themes.SPACING.xl,
    color: Themes.COLORS.textMuted,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: Themes.SPACING.xs,
  },
  cancelButton: {
    backgroundColor: Themes.COLORS.background,
    borderWidth: 1,
    borderColor: Themes.COLORS.border || "#E0E0E0",
  },
  cancelButtonText: {
    ...Themes.TYPOGRAPHY.label,
    color: Themes.COLORS.textDark,
  },
  deleteButton: {
    backgroundColor: "#F44336", // Red for danger action
  },
  deleteButtonText: {
    ...Themes.TYPOGRAPHY.label,
    color: "#FFF",
    fontFamily: "Fredoka-SemiBold",
  },
});
