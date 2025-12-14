import { Text, View, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import NotificationCard from "../../../component/notificationCard";
const api = require("../../../api/axios");

export default function Notification() {
  const [notification, setNotification] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(false);

  const getNotification = async (pageNum = 1) => {
    console.log(`HEY THIS IS THE PAGE FOR NOTIFICATION ${page}`);
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await api.get("/api/notification/notification", {
        params: {
          page: pageNum,
        },
      });
      const newNotification = res.data.body;
      setNotification((prev) => [...prev, ...newNotification]);

      if (newNotification.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      if (refresh) setRefresh(false);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    setHasMore(true);
    setNotification([]);
    setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    getNotification(page);
  }, [page]);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notification}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <NotificationCard notification={item}></NotificationCard>;
        }}
        ListEmptyComponent={<Text>No notification</Text>}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : !hasMore ? (
            <Text>No Notification</Text>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshing={refresh}
        onRefresh={onRefresh}
      ></FlatList>
    </View>
  );
}
