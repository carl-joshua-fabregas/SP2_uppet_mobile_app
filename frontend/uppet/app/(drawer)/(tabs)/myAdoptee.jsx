import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import ViewAdopteesCard from "../../../component/ViewMyAdopteesCard";
import { useState, useEffect } from "react";
const api = require("../../../api/axios");

export default function MyAdoptee() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);
  console.log(`HEY THIS IS THE PAGE FOR MYPETS ${page}`);

  const getPets = async (pageNum = 1, isRefreshing = false) => {
    if (loading || (!hasMore && !isRefreshing)) return;
    setLoading(true);
    try {
      const res = await api.get("/api/pet/myPets", {
        params: {
          page: pageNum,
        },
      });
      const myAdoptees = res.data.body;
      setPets((prev) => [...prev, ...myAdoptees]);
      console.log(pets);
      if (myAdoptees.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = () => {
    setHasMore(true);
    setPets([]);
    setPage(1);
    getPets(1, true);
  };
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      getPets(page + 1);
    }
  };

  useEffect(() => {
    getPets(page);
  }, []);
  return (
    <View>
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          console.log(item);
          return <ViewAdopteesCard pet={item}></ViewAdopteesCard>;
        }}
        ListEmptyComponent={<Text>No Pets found</Text>}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : !hasMore ? (
            <Text>No More Application</Text>
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
