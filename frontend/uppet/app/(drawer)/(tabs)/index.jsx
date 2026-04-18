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
import { useNavigation } from "@react-navigation/native";
import PetCardHome from "../../../component/PetCardHome";
import PetModal from "../../../component/PetModal";
import * as Themes from "../../../assets/themes/themes";
const api = require("../../../api/axios");
export default function Index() {
  const router = useNavigation();
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const setSelectedPetLatest = selectedPet
    ? pets.find((pet) => pet._id === selectedPet._id)
    : null;

  const getPets = async (pageNum = 1, isRefreshing = false) => {
    if (loading || (!hasMore && !isRefreshing)) {
      return;
    }
    setLoading(true);

    try {
      console.log("pageNum:", pageNum);

      const res = await api.get("/api/pet/avail", {
        params: { page: pageNum },
      });
      const newPets = res.data.body;
      setPets((prev) => [...prev, ...newPets]);

      if (newPets.length < 10) {
        console.log("THERE ARE NO MORE PETS");
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching pets:", err);
      console.error("Status:", err.response?.status); // Is it actually 404?
      console.error("Data:", err.response?.data); // Does it say "Pet not found"?
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
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
      getPets(page + 1);
    }
  };

  useEffect(() => {
    getPets(page);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          return (
            <PetCardHome
              pet={item}
              onPress={() => {
                setSelectedPet(item);
                console.log("Selected pet:", item);
              }}
            ></PetCardHome>
          );
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
      <View style={styles.buttonContainer}>
        <Button
          title="POST"
          onPress={() => {
            console.log("Pressed home button");
            // router.navigate("createPetProfile");
            router.navigate("createPetProfile");
          }}
        ></Button>
      </View>
      {setSelectedPetLatest && (
        <PetModal
          pet={setSelectedPetLatest}
          onClose={() => setSelectedPet(null)}
        ></PetModal>
      )}
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
