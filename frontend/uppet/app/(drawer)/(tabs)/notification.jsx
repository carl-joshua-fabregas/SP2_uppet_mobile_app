import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import NotificationCard from "../../../component/notificationCard";
import { api } from "../../../api/axios";
import * as Themes from "../../../assets/themes/themes";

export default function Notification() {
  const [notification, setNotification] = useState([]);
  const [liveNotification, setLiveNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotification = async (pageNum = 1, isRefresing = false) => {
    console.log(`HEY THIS IS THE PAGE FOR NOTIFICATION ${page}`);
    setLoading(true);
    try {
      const res = await api.get("/api/notification/notification", {
        params: {
          page: pageNum,
        },
      });
      const newNotification = res.data?.body;
      setNotification((prev) => {
        if (isRefresing) return newNotification;
        else return [...prev, ...newNotification];
      });

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
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchNotification(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNotification(page + 1);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchNotification(page);
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
