import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import PetCard from "../../../component/PetCard";
const api = require("../../../api/axios");
export default function Index() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const getPets = async (pageNum = 1) => {
    console.log(page);

    if (loading || !hasMore) {
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/api/pet/avail", {
        params: { page: pageNum },
      });
      const newPets = res.data.body;
      setPets((prev) => [...prev, ...newPets]);

      if (newPets.length === 0) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setLoading(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    getPets(page);
  }, [page]);

  return (
    <View>
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return <PetCard pet={item}></PetCard>;
        }}
        ListEmptyComponent={<Text>No pets found</Text>}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : !hasMore ? (
            <Text>No more pets</Text>
          ) : null
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      ></FlatList>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
});
