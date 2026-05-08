import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import PetCardHome from "../../../component/PetCardHome";
import PetModal from "../../../component/PetModal";
import * as Themes from "../../../assets/themes/themes";
import { api } from "../../../api/axios";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSocket } from "../../../context/SocketContext";

export default function Index() {
  const socket = useSocket();
  const router = useNavigation();

  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.heading.fontSize,
  );

  // Separate states for "All" and "Best Match" tabs
  const [all, setAll] = useState({
    pets: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [bestMatch, setBestMatch] = useState({
    pets: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [activeTab, setActiveTab] = useState("all");
  const [selectedPet, setSelectedPet] = useState(null);

  const isFetchingRef = useRef({
    all: false,
    bestMatch: false,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Determine current active state
  const currentData = activeTab === "all" ? all : bestMatch;

  const setSelectedPetLatest = selectedPet
    ? currentData.pets.find((pet) => pet._id === selectedPet._id)
    : null;

  const fetchAllPets = async (lastPet, isRefreshing = false) => {
    setAll((prev) => ({ ...prev, loading: true }));
    isFetchingRef.current.all = true;
    try {
      const limit = all.pets.length === 0 ? initialLimit : 10;
      const res = await api.get("/api/pet/avail", {
        params: {
          lastPetID: lastPet ? lastPet._id : null,
          limit: limit,
          lastPetUpdate: lastPet ? lastPet.updatedAt : null,
        },
      });
      const newPets = res.data.body;

      if (newPets?.length < 10) {
        setAll((prev) => ({ ...prev, hasMore: false }));
      }
      setAll((prev) => ({
        ...prev,
        pets: isRefreshing ? newPets : [...prev.pets, ...newPets],
        tabCursorID:
          newPets.length > 0 ? newPets[newPets.length - 1] : prev.tabCursorID,
      }));
    } catch (err) {
      console.error("Error fetching all pets:", err);
    } finally {
      isFetchingRef.current.all = false;
      setAll((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const fetchBestMatchPets = async (lastMatch, isRefreshing = false) => {
    setBestMatch((prev) => ({ ...prev, loading: true }));
    isFetchingRef.current.bestMatch = true;
    try {
      const limit = bestMatch.pets.length === 0 ? initialLimit : 10;
      // Note: adjust this endpoint or parameters if you have a specific best match route
      console.log(lastMatch, limit, lastMatch?.score);
      const res = await api.get("/api/match/bestMatch", {
        params: {
          lastCursorID: lastMatch ? lastMatch._id : null,
          limit: limit,
          lastCursorScore: lastMatch ? lastMatch.score : null,
        },
      });
      const newMatches = res.data.body;

      if (newMatches?.length < 10) {
        setBestMatch((prev) => ({ ...prev, hasMore: false }));
      }
      const extractedPets = newMatches.map((match) => match.petID);
      setBestMatch((prev) => ({
        ...prev,
        pets: isRefreshing ? extractedPets : [...prev.pets, ...extractedPets],
        tabCursorID:
          newMatches.length > 0
            ? newMatches[newMatches.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.error("Error fetching best match pets:", err);
    } finally {
      isFetchingRef.current.bestMatch = false;
      setBestMatch((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const onRefreshAll = async () => {
    setAll((prev) => ({
      ...prev,
      pets: [],
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
      loading: false,
    }));
    await fetchAllPets(null, true);
  };

  const onRefreshBestMatch = async () => {
    setBestMatch((prev) => ({
      ...prev,
      pets: [],
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
      loading: false,
    }));
    await fetchBestMatchPets(null, true);
  };

  const handleLoadMoreAll = () => {
    if (!all.loading && all.hasMore && !isFetchingRef.current.all) {
      fetchAllPets(all.tabCursorID);
    }
  };

  const handleLoadMoreBestMatch = () => {
    if (
      !bestMatch.loading &&
      bestMatch.hasMore &&
      !isFetchingRef.current.bestMatch
    ) {
      fetchBestMatchPets(bestMatch.tabCursorID);
    }
  };

  useEffect(() => {
    fetchAllPets(null, true);
    fetchBestMatchPets(null, true);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // 1. Define the handlers
    const handlePetCreated = (data) => {
      setAll((prev) => {
        const isInArray = prev.pets.some((p) => p._id === data.pet._id);
        return isInArray ? prev : { ...prev, pets: [data.pet, ...prev.pets] };
      });
      setBestMatch((prev) => {
        const isInArray = prev.pets.some((p) => p._id === data.pet._id);
        return isInArray ? prev : { ...prev, pets: [data.pet, ...prev.pets] };
      });
    };

    const handlePetDeleted = (data) => {
      setAll((prev) => ({
        ...prev,
        pets: prev.pets.filter((pet) => pet._id !== data.petID),
      }));
      setBestMatch((prev) => ({
        ...prev,
        pets: prev.pets.filter((pet) => pet._id !== data.petID),
      }));
    };

    const handlePetUpdated = (data) => {
      setAll((prev) => ({
        ...prev,
        pets: prev.pets.map((p) => (p._id === data.pet._id ? data.pet : p)),
      }));
      setBestMatch((prev) => ({
        ...prev,
        pets: prev.pets.map((p) => (p._id === data.pet._id ? data.pet : p)),
      }));
    };

    // 2. Attach handlers
    socket.on("pet_created", handlePetCreated);
    socket.on("pet_deleted", handlePetDeleted);
    socket.on("pet_updated", handlePetUpdated);

    // 3. Remove ONLY these specific handlers on unmount
    return () => {
      socket.off("pet_created", handlePetCreated);
      socket.off("pet_deleted", handlePetDeleted);
      socket.off("pet_updated", handlePetUpdated);
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      {/* Custom Tab UI - Smooth Boxes */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "all" && styles.activeTab]}
            onPress={() => handleTabChange("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "bestMatch" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("bestMatch")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "bestMatch" && styles.activeTabText,
              ]}
            >
              Best Match
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* The separating layer for the contents */}
      <View style={styles.contentDivider} />

      {/* --- ALL PETS LIST --- */}
      <View style={[styles.listWrapper, activeTab !== "all" && styles.hidden]}>
        <FlatList
          contentContainerStyle={styles.scrollContet}
          data={all.pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PetCardHome pet={item} onPress={() => setSelectedPet(item)} />
          )}
          ListEmptyComponent={
            !all.loading && (
              <Text style={styles.emptyText}>No Available Pets Found</Text>
            )
          }
          ListFooterComponent={
            all.hasMore && all.pets.length > 0 ? (
              <ActivityIndicator
                size="large"
                color={Themes.COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          onEndReached={handleLoadMoreAll}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={all.refreshing}
              onRefresh={onRefreshAll}
              tintColor={Themes.COLORS.primary}
            />
          }
        />
      </View>

      {/* --- BEST MATCH PETS LIST --- */}
      <View
        style={[styles.listWrapper, activeTab !== "bestMatch" && styles.hidden]}
      >
        <FlatList
          contentContainerStyle={styles.scrollContet}
          data={bestMatch.pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <PetCardHome pet={item} onPress={() => setSelectedPet(item)} />
          )}
          ListEmptyComponent={
            !bestMatch.loading && (
              <Text style={styles.emptyText}>No Matches Found</Text>
            )
          }
          ListFooterComponent={
            bestMatch.hasMore && bestMatch.pets.length > 0 ? (
              <ActivityIndicator
                size="large"
                color={Themes.COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          onEndReached={handleLoadMoreBestMatch}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={bestMatch.refreshing}
              onRefresh={onRefreshBestMatch}
              tintColor={Themes.COLORS.primary}
            />
          }
        />
      </View>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          console.log("Pressed home button");
          router.navigate("createPetProfile");
        }}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
      </TouchableOpacity>

      {setSelectedPetLatest && (
        <PetModal
          pet={setSelectedPetLatest}
          onClose={() => setSelectedPet(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Themes.COLORS.background,
    flex: 1,
  },
  // --- Tab UI Styles ---
  tabWrapper: {
    paddingHorizontal: Themes.SPACING.md,
    paddingTop: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.md,
    backgroundColor: Themes.COLORS.background,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Themes.COLORS.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  // --- Content Separator ---
  contentDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    width: "100%",
    marginBottom: Themes.SPACING.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Themes.COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textFaded || "#888",
    textAlign: "center",
    marginTop: 100,
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },
  scrollContet: {
    flexGrow: 1,
    paddingHorizontal: Themes.SPACING.md,
    paddingBottom: 50,
  },
  listWrapper: {
    flex: 1, // Ensures the list takes up the remaining space
  },
  hidden: {
    display: "none", // Hides the list without unmounting it
  },
});
