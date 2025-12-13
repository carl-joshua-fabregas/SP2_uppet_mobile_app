import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  Dimensions,
} from "react-native";
import { useState, useEffect } from "react";
import PetCard from "../../../component/PetCard";
const api = require("../../../api/axios");
export default function Index() {
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const getPets = async (pageNum = 1) => {
    console.log(`HEY THIS IS THE PAGE FOR PETS ${page}`);
    console.log(`has more is ${hasMore} and loading is ${loading}`);
    if (loading || !hasMore) {
      console.log("STOP THE CAR");
      return;
    }
    setLoading(true);

    try {
      const res = await api.get("/api/pet/avail", {
        params: { page: pageNum },
      });
      const newPets = res.data.body;
      setPets((prev) => [...prev, ...newPets]);

      // console.log(`this is the query result for page ${page} ${newPets}`);
      console.log(res.data.body);
      if (newPets.length < 10) {
        console.log("IS THIS FIRING");
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
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    getPets(page);
  }, [page, getPets]);

  return (
    <View>
      <View>
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            return <PetCard pet={item}></PetCard>;
          }}
          ListEmptyComponent={<Text>No pets found</Text>}
          ListFooterComponent={
            hasMore ? (
              <ActivityIndicator size="large" />
            ) : !hasMore ? (
              <Text>No more pets</Text>
            ) : null
          }
          onEndReached={hasMore ? loadMore : null}
          onEndReachedThreshold={0.1}
          refreshing={refresh}
          onRefresh={onRefresh}
        ></FlatList>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="POST"
          onPress={() => console.log("Pressed home button")}
        ></Button>
      </View>
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
  buttonContainer: {
    position: "absolute",
    bottom: Dimensions.get("window").height / 15,
    right: Dimensions.get("window").width / 9,
  },
});
