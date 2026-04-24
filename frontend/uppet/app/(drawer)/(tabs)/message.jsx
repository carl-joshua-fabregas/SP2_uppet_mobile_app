import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import NotificationCard from "../../../component/notificationCard";
import { api } from "../../../api/axios";
import * as Themes from "../../../assets/themes/themes";
import { useSocket } from "../../../context/SocketContext";
import { useUser } from "../../../context/UserContext";
import { useNavigation } from "@react-navigation/native";
// import { useChats } from "../../../context/ChatContext";


export default function ChatList() {
  // const { chatlist, setChatlist } = useChats();
  const navigation = useNavigation()
  const [chatlist, setChatlist] = useState([])
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();

  const fetchChatList = async (pageNum = 1, isRefresing = false) => {
    console.log(`HEY THIS IS THE PAGE FOR Fetch Chat List ${page}`);
    setLoading(true);
    try {
      const res = await api.get("/api/chatlist/get", {
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
      console.log("THIS IS THE CHATLIST", newChatList)
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

  useEffect(() => {
    if (!socket) return;

    socket.on("update_chatlist", (updatedConversation) => {
      setChatlist((prevChats) => {
        const chatIndexLoc = prevChats.findIndex(
          (chatlist) => chatlist._id === updatedConversation._id,
        );
        const updatedChats = [...prevChats];

        //if Existing
        if (chatIndexLoc !== -1) {
          //Update the value we have of the object in the frontend
          updatedChats[chatIndexLoc] = updatedConversation;
          const [moveChat] = updatedChats.splice(chatIndexLoc, 1);
          updatedChats.unshift(moveChat);
        } else {
          //This means it is new
          updatedChats.unshift(updatedConversation);
        }
        return updatedChats;
      });
    });

    return () => socket.off("update_chatlist");
  }, [socket]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>{
        console.log("I have been clicked this are my values", item)
        navigation.navigate("messageScreen", {
          chatThreadOrigin: item,
          receiverID: item.members[0]._id,
        })}
      }
    >
      <View style={styles.avatar}>
        <Text
          style={{ ...Themes.TYPOGRAPHY.subheading, color: Themes.COLORS.primaryDark }}
        >
          {item.members[0].firstName ||
          item.members[0].middleName ||
          item.members[0].lastName
            ? `${item.members[0].firstName} ${item.members[0].middleName || ""} ${item.members[0].lastName}`
            : "U"}
            
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={Themes.TYPOGRAPHY.subheading}>{item.receiverName}</Text>
        <Text style={Themes.TYPOGRAPHY.body} numberOfLines={1}>
          {item.lastMessage?.body || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chatlist}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: Themes.SPACING.md }}
        ListEmptyComponent={<Text style={styles.emptyText}>Chat is Empty</Text>}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" /> : null
        }
      />
    </View>
  );
}
//   const MessageCard = ({ message }) => {
//     return (
//       <View style={{ flex: 1 }}>
//         <Text>{message}</Text>
//       </View>
//     );
//   };
//   const fetchChatList = async (pageNum = 1, isRefresing = false) => {
//     console.log(`HEY THIS IS THE PAGE FOR NOTIFICATION ${page}`);
//     setLoading(true);
//     try {
//       const res = await api.get("/api/notification/notification", {
//         params: {
//           page: pageNum,
//         },
//       });

//       const newChatList = res?.data?.body;

//       if (newChatList?.length < 10) {
//         console.log("TRUE");
//         setHasMore(false);
//       }
//       setChatlist((prev) => {
//         if (isRefresing) return newChatList;
//         else return [...prev, ...newChatList];
//       });
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     setPage(1);
//     setHasMore(true);
//     await fetchChatList(1, true);
//   });

//   const handleLoadMore = () => {
//     if (!loading && hasMore) {
//       fetchChatList(page + 1);
//       setPage((prev) => prev + 1);
//     }
//   };

//   useEffect(() => {
//     fetchChatList(page);
//   }, []);
//   return (
//     <View style={{ flex: 1 }}>
//       <FlatList
//         data={chatlist}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => {
//           return <MessageCard message={item.message}></MessageCard>;
//         }}
//         ListEmptyComponent={<Text style={styles.emptyText}>Chat is Empty</Text>}
//         ListFooterComponent={
//           loading ? <ActivityIndicator size="large" /> : null
//         }
//         onEndReached={handleLoadMore}
//         onEndReachedThreshold={0.5}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           ></RefreshControl>
//         }
//       ></FlatList>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     backgroundColor: Themes.COLORS.background,
//     justifyContent: "center",
//     alignItems: "center",
//     flex: 1,
//   },
//   emptyText: {
//     fontFamily: Themes.Themes.TYPOGRAPHY.body.fontFamily,
//     fontSize: 16,
//     color: Themes.COLORS.textFaded || "#888",
//     textAlign: "center",
//     marginTop: 100, // Pushes it down so it's not hugging the top
//     paddingHorizontal: Themes.SPACING.lg,
//     lineHeight: 22,
//   },
// });
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Themes.COLORS.background },
  card: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.card,
    padding: Themes.SPACING.md,
    marginHorizontal: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: Themes.RADIUS.pill,
    backgroundColor: Themes.COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Themes.SPACING.md,
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
