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

export default function ChatList() {
  const [chatList, setChatlist] = useState([]);
  const [liveChatList, setLiveChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const MessageCard = ({ message }) => {
    return (
      <View style={{ flex: 1 }}>
        <Text>{message}</Text>
      </View>
    );
  };
  const fetchChatList = async (pageNum = 1, isRefresing = false) => {
    console.log(`HEY THIS IS THE PAGE FOR NOTIFICATION ${page}`);
    setLoading(true);
    try {
      const res = await api.get("/api/notification/notification", {
        params: {
          page: pageNum,
        },
      });

      const newChatList = res?.data?.body;

      if (newChatList?.length < 10) {
        console.log("TRUE");
        setHasMore(false);
      }
      setChatlist((prev) => {
        if (isRefresing) return newChatList;
        else return [...prev, ...newChatList];
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchChatList(1, true);
  });

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchChatList(page + 1);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchChatList(page);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chatList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <MessageCard message={item.message}></MessageCard>;
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Chat is Empty</Text>}
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
