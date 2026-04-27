import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Button,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import PetCardHome from "../../../component/PetCardHome";
import PetModal from "../../../component/PetModal";
import * as Themes from "../../../assets/themes/themes";
import { api } from "../../../api/axios";
export default function Index() {
  const isFetchingRef = useRef(false);
  const [cursor, setCursor] = useState(null);
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.heading.fontSize,
  );

  const router = useNavigation();
  const [pets, setPets] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const setSelectedPetLatest = selectedPet
    ? pets.find((pet) => pet._id === selectedPet._id)
    : null;

  const fetchPets = async (lastPet, isRefreshing = false) => {
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const limit = pets.length > 0 ? 10 : initialLimit;
      const res = await api.get("/api/pet/avail", {
        params: {
          lastPetID: lastPet ? lastPet._id : null,
          limit: limit,
          lastPetUpdate: lastPet ? lastPet.updatedAt : null,
        },
      });
      const newPets = res.data.body;

      if (newPets?.length < 10) {
        setHasMore(false);
      }
      setPets((prev) => {
        if (isRefreshing) return newPets;
        else return [...prev, ...newPets];
      });
      if (newPets.length > 0) {
        setCursor(newPets[newPets.length - 1]);
      }
      console.log("FINISHED FETHCING PETS");
    } catch (err) {
      console.error("Error fetching pets:", err);
      console.error("Status:", err.response?.status); // Is it actually 404?
      console.error("Data:", err.response?.data); // Does it say "Pet not found"?
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchPets(null, true);
  }, []);

  useEffect(() => {
    fetchPets(null);
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore && !isFetchingRef.current) {
      fetchPets(cursor);
    }
  };
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
              }}
            ></PetCardHome>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>No Available Pets Found</Text>
          )
        }
        ListFooterComponent={
          hasMore ? <ActivityIndicator size="large" /> : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          ></RefreshControl>
        }
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
