import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import NotificationCard from "../../../component/notificationCard";
import { api } from "../../../api/axios";
import * as Themes from "../../../assets/themes/themes";

export default function Notification() {
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );
  const [notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cursorID, setCursorID] = useState(null);
  const isFetchingRef = useRef(false);

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
      console.error("Status:", err.response?.status); // Is it actually 404?
      console.error("Data:", err.response?.data); // Doe
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

  useEffect(() => {
    fetchNotification(null);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notification}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <NotificationCard notification={item}></NotificationCard>;
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No Notifications</Text>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" /> : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
      ></FlatList>
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
    marginTop: 100, // Pushes it down so it's not hugging the top
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
});
