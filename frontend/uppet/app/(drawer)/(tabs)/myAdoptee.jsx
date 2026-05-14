import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import ViewAdopteesCard from "../../../component/ViewMyAdopteesCard";
import { useState, useEffect, useCallback, useRef } from "react";
import * as Themes from "../../../assets/themes/themes";
import { api } from "../../../api/axios";
import { useSocket } from "../../../context/SocketContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyAdoptee() {
  const socket = useSocket();
  const insets = useSafeAreaInsets();
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.badgeText.fontSize,
  );

  const [pending, setPending] = useState({
    pets: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [adopted, setAdopted] = useState({
    pets: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [activeTab, setActiveTab] = useState("pending");

  const isFetchingRef = useRef({
    pending: false,
    adopted: false,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchAvailablePets = async (lastId, isRefreshing = false) => {
    setPending((prev) => ({ ...prev, loading: true }));
    isFetchingRef.current.pending = true;
    try {
      const limit = pending.pets.length === 0 ? initialLimit : 10;
      const res = await api.get("/api/pet/myPets/pending", {
        params: {
          lastId: pending.tabCursorID ? pending.tabCursorID._id : null,
          limit: limit,
          lastPetUpdate: pending.tabCursorID
            ? pending.tabCursorID.updatedAt
            : null,
        },
      });
      const myAdoptees = res.data?.body || [];
      if (myAdoptees.length < 10) {
        setPending((prev) => ({ ...prev, hasMore: false }));
      }
      setPending((prev) => ({
        ...prev,
        pets: isRefreshing ? myAdoptees : [...prev.pets, ...myAdoptees],
        tabCursorID:
          myAdoptees.length > 0
            ? myAdoptees[myAdoptees.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      isFetchingRef.current.pending = false;
      setPending((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const fetchAdoptedPets = async (lastId, isRefreshing = false) => {
    setAdopted((prev) => ({ ...prev, loading: true }));
    isFetchingRef.current.adopted = true;
    try {
      const limit = adopted.pets.length === 0 ? initialLimit : 10;
      const res = await api.get("/api/pet/myPets/adopted", {
        params: {
          lastId: adopted.tabCursorID ? adopted.tabCursorID._id : null,
          limit: limit,
          lastPetUpdate: adopted.tabCursorID
            ? adopted.tabCursorID.updatedAt
            : null,
        },
      });
      const myAdoptees = res.data.body;
      if (myAdoptees.length < 10) {
        setAdopted((prev) => ({ ...prev, hasMore: false }));
      }
      setAdopted((prev) => ({
        ...prev,
        pets: isRefreshing ? myAdoptees : [...prev.pets, ...myAdoptees],
        tabCursorID:
          myAdoptees.length > 0
            ? myAdoptees[myAdoptees.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.error("Error fetching pets:", err);
    } finally {
      isFetchingRef.current.adopted = false;
      setAdopted((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const onRefreshAvailable = useCallback(async () => {
    setPending({
      pets: [],
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
      loading: false,
    });
    await fetchAvailablePets(null, true);
  }, []);

  const onRefreshAdopted = useCallback(async () => {
    setAdopted({
      pets: [],
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
      loading: false,
    });
    await fetchAdoptedPets(null, true);
  }, []);

  const handleLoadMoreAvailable = () => {
    if (!pending.loading && pending.hasMore && !isFetchingRef.current.pending) {
      fetchAvailablePets(pending.tabCursorID);
    }
  };

  const handleLoadMoreAdopted = () => {
    if (!adopted.loading && adopted.hasMore && !isFetchingRef.current.adopted) {
      fetchAdoptedPets(adopted.tabCursorID);
    }
  };

  useEffect(() => {
    fetchAvailablePets(null, true);
    fetchAdoptedPets(null, true);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleCreate = (data) => {
      console.log("PET CREATED AND MESSAGE IS", data.message);
      setPending((prev) => {
        if (prev.pets.some((p) => p._id === data.pet._id)) return prev;
        return { ...prev, pets: [data.pet, ...prev.pets] };
      });
    };

    const handleUpdate = (data) => {
      const updatelist = (prev) => ({
        ...prev,
        pets: prev.pets.map((p) => (p._id === data.pet._id ? data.pet : p)),
      });

      setPending(updatelist);
      setAdopted(updatelist);
    };

    const handleDelete = (data) => {
      const updatelist = (prev) => ({
        ...prev,
        pets: prev.pets.filter((p) => p._id !== data.pet),
      });

      setPending(updatelist);
      setAdopted(updatelist);
    };
    const handleAppApproved = (data) => {
      const petId =
        data.adoptionApp.petToAdopt._id || data.adoptionApp.petToAdopt;

      // Access pending.pets directly from the component's current render cycle
      const adoptedPet = pending.pets.find((p) => p._id === petId);

      if (adoptedPet) {
        // 1. Remove from pending
        setPending((prev) => ({
          ...prev,
          pets: prev.pets.filter((p) => p._id !== petId),
        }));

        // 2. Add to adopted
        setAdopted((prev) => ({
          ...prev,
          pets: [adoptedPet, ...prev.pets],
        }));
      }
    };

    socket.on("adoptionApp_approved", handleAppApproved);

    // Don't forget to add it to the cleanup return!
    socket.on("pet_created", handleCreate);
    socket.on("pet_updated", handleUpdate);
    socket.on("pet_deleted", handleDelete);

    return () => {
      socket.off("pet_created", handleCreate);
      socket.off("pet_updated", handleUpdate);
      socket.off("pet_deleted", handleDelete);
      socket.off("adoptionApp_approved", handleAppApproved);
    };
  }, [socket]);
  return (
    <View style={styles.cardContainer}>
      {/* Custom Tab UI - Smooth Boxes */}
      <View style={styles.tabWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "pending" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("pending")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending ({pending.pets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "adopted" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("adopted")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "adopted" && styles.activeTabText,
              ]}
            >
              Adopted ({adopted.pets.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* The separating layer for the contents */}
      <View style={styles.contentDivider} />
      <View
        style={[styles.listWrapper, activeTab !== "pending" && styles.hidden]}
        key={`pending-${activeTab}`}
      >
        <FlatList
          data={pending.pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ViewAdopteesCard pet={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 50 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={pending.refreshing}
              onRefresh={onRefreshAvailable} // 👈 explicitly pending
              tintColor={Themes.COLORS.primary}
            />
          }
          ListEmptyComponent={
            !pending.loading && (
              <Text style={styles.emptyText}>
                No Pending Adoptees Found {/* 👈 Simplified */}
              </Text>
            )
          }
          onEndReached={handleLoadMoreAvailable} // 👈 explicitly pending
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            pending.hasMore && pending.pets.length > 0 ? (
              <ActivityIndicator
                size="large"
                color={Themes.COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      </View>
      <View
        style={[styles.listWrapper, activeTab !== "adopted" && styles.hidden]}
        key={`adopted-${activeTab}`}
      >
        <FlatList
          data={adopted.pets}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ViewAdopteesCard pet={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 50 + insets.bottom },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={adopted.refreshing}
              onRefresh={onRefreshAdopted} // 👈 explicitly adopted
              tintColor={Themes.COLORS.primary}
            />
          }
          ListEmptyComponent={
            !adopted.loading && (
              <Text style={styles.emptyText}>
                No Successful Adoptees Found {/* 👈 Simplified */}
              </Text>
            )
          }
          onEndReached={handleLoadMoreAdopted} // 👈 explicitly adopted
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            adopted.hasMore && adopted.pets.length > 0 ? (
              <ActivityIndicator
                size="large"
                color={Themes.COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
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
    backgroundColor: "#F1F5F9", // Soft background holding the boxes
    borderRadius: 10, // Smooth outer edges
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8, // Smooth edges for the actual buttons
  },
  activeTab: {
    backgroundColor: Themes.COLORS.primary, // Active tab pops out as a white box
    // Subtle shadow to lift the active box
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: "#64748B", // Faded text for inactive
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // --- Content Separator ---
  contentDivider: {
    height: 1,
    backgroundColor: "#E2E8F0", // Thin line separating tabs from the list
    width: "100%",
    marginBottom: Themes.SPACING.sm, // Gives breathing room before the FlatList starts
  },
  // List Styles
  listContent: {
    paddingHorizontal: Themes.SPACING.md,
    paddingTop: Themes.SPACING.sm,
    paddingBottom: Themes.SPACING.xl,
    flexGrow: 1,
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
  listWrapper: {
    flex: 1, // Ensures the list takes up the remaining space
  },
  hidden: {
    display: "none", // Hides the list without unmounting it
  },
});
