import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import PetCard from "../../../component/PetCard";
import { useState, useEffect } from "react";
const api = require("../../../api/axios");

export default function MyAdoptee() {
  console.log(`HEY THIS IS THE PAGE FOR MYPETS ${page}`);

  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const getPets = async (pageNum = 1) => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await api.get("/api/pet/myPets", {
        params: {
          page: pageNum,
        },
      });
      const myAdoptees = res.data.body;
      setPets([...pets, ...myAdoptees]);
      console.log(pets);
      if (myAdoptees.length < 10) {
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
    setPets([]);
    setPage(1);
  };
  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    getPets(page);
  }, [page, getPets]);
  return (
    <View>
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          console.log(item);
          return <PetCard pet={item}></PetCard>;
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
