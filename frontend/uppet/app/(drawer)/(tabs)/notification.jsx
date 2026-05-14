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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Notification() {
  const socket = useSocket();
  const insets = useSafeAreaInsets();
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
    if (isFetchingRef.current) return; // Add this early return
    isFetchingRef.current = true;
    if (!isRefreshing) {
      setLoading(true);
    }
    try {
      // Change it to this:
      const limit = notification.length === 0 ? initialLimit : 10;
      const res = await api.get("/api/notification/notifications", {
        params: {
          cursorID: cursorID,
          limit: limit,
        },
      });

      // Validate response structure
      if (!res.data) {
        throw new Error("Invalid response structure from server");
      }

      const newNotification = res.data?.body || [];

      // Validate that notifications are actual objects
      if (!Array.isArray(newNotification)) {
        console.error(
          "Expected array of notifications, got:",
          typeof newNotification,
        );
        setNotification(isRefreshing ? [] : (prev) => prev);
        setHasMore(false);
        return;
      }

      setNotification((prev) => {
        if (isRefreshing) return newNotification;
        else return [...prev, ...newNotification];
      });

      // Update cursor ID only if we have notifications
      if (newNotification?.length > 0) {
        const lastNotification = newNotification[newNotification.length - 1];
        if (lastNotification?._id) {
          setCursorID(lastNotification._id);
        }
      }

      // Check if we've reached the end
      if (newNotification?.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Keep existing notifications on error during load more
      if (!isRefreshing) {
        setNotification((prev) => prev); // Keep existing data
      }
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
    if (!id) {
      console.warn("markIsRead called with invalid id:", id);
      return;
    }

    try {
      // 1. Pass the exact ID to the API
      await api.patch(`/api/notification/${id}`);

      // 2. Update the local state so the UI reacts instantly
      setNotification((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isRead: true } : item,
        ),
      );

      console.log("Notification marked as read:", id);
    } catch (err) {
      console.error("Error marking notification as read:", err.message);
      // Don't throw - let the notification stay in unread state on error
      // User can still interact with the notification
    }
  };
  // --- Delete Handlers ---
  const handleLongPress = (id) => {
    setSelectedNotifId(id);
    setModalVisible(true);
  };

  const handleDeleteNotification = async () => {
    if (!selectedNotifId) {
      console.warn("Delete called with no selected notification");
      return;
    }

    setIsDeleting(true);

    try {
      // Call the backend delete endpoint
      await api.delete(`/api/notification/${selectedNotifId}`);

      // Remove from UI immediately for better UX
      setNotification((prev) =>
        prev.filter((item) => item._id !== selectedNotifId),
      );

      console.log("Notification deleted:", selectedNotifId);
    } catch (error) {
      console.error("Failed to delete notification:", error.message);
      // Show error but don't close modal - let user retry
      // Could add a toast notification here for better UX
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
    if (!socket) {
      console.warn("Socket not available for real-time notifications");
      return;
    }

    const handleNotificationCreated = (data) => {
      console.log("New notification received:", data?.notification?.message);

      // Validate incoming notification
      if (!data?.notification || !data.notification._id) {
        console.warn("Invalid notification data received:", data);
        return;
      }

      // Check if notification already exists in the list (avoid duplicates)
      setNotification((prev) => {
        const isDuplicate = prev.some(
          (notif) => notif._id === data.notification._id,
        );
        if (isDuplicate) {
          console.log("Duplicate notification detected, skipping");
          return prev;
        }
        // Add new notification to the top
        return [data.notification, ...prev];
      });
    };

    const handleNotificationDeleted = (data) => {
      console.log("Notification deleted event received:", data?.notification);

      if (!data?.notification) {
        console.warn("Delete event missing notification ID");
        return;
      }

      setNotification((prev) =>
        prev.filter((notif) => notif._id !== data.notification),
      );
    };

    // Register socket listeners
    socket.on("notification_created", handleNotificationCreated);
    socket.on("notification_deleted", handleNotificationDeleted);

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("notification_created", handleNotificationCreated);
      socket.off("notification_deleted", handleNotificationDeleted);
    };
  }, [socket]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Themes.COLORS.background,
      }}
    >
      <FlatList
        data={notification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 50 + insets.bottom }}
        renderItem={({ item }) => {
          return (
            <NotificationCard
              notification={item}
              onLongPress={handleLongPress}
              markIsRead={markIsRead}
              userRole="adopter" // or pull from your auth context
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
