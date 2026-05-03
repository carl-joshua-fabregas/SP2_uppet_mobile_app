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
import ViewApplicantsCard from "../component/ViewApplicantsListCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";
import { api } from "../api/axios";

export default function ViewApplicantList(props) {
  const router = useRoute();
  const [activeTab, setActiveTab] = useState("pending");
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.badgeText.fontSize,
  );

  const isFetchingRef = useRef({
    pending: false,
    approved: false,
    rejected: false,
  });

  const [pending, setPending] = useState({
    applicants: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [approved, setApproved] = useState({
    applicants: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const [rejected, setRejected] = useState({
    applicants: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    tabCursorID: null,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const fetchPendingApplicants = async (lastCursorID, isRefreshing = false) => {
    isFetchingRef.current.pending = true;
    setPending((prev) => ({ ...prev, loading: true }));
    try {
      const limit = pending.applicants.length === 0 ? initialLimit : 10;
      const res = await api.get(
        `/api/adoptionApp/${router.params.petID}/pending`,
        {
          params: {
            lastId: pending.tabCursorID ? pending.tabCursorID._id : null,
            limit: limit,
            lastAppUpdate: pending.tabCursorID
              ? pending.tabCursorID.updatedAt
              : null,
          },
        },
      );
      const applicantsArr = res.data.body;

      if (applicantsArr.length < limit) {
        setPending((prev) => ({ ...prev, hasMore: false }));
      }
      setPending((prev) => ({
        ...prev,
        applicants: isRefreshing
          ? applicantsArr
          : [...prev.applicants, ...applicantsArr],
        tabCursorID:
          applicantsArr.length > 0
            ? applicantsArr[applicantsArr.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.log(err);
    } finally {
      isFetchingRef.current.pending = false;
      setPending((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const fetchApprovedApplicants = async (
    lastCursorID,
    isRefreshing = false,
  ) => {
    isFetchingRef.current.approved = true;
    setApproved((prev) => ({ ...prev, loading: true }));
    try {
      const limit = approved.applicants.length === 0 ? initialLimit : 10;
      const res = await api.get(
        `/api/adoptionApp/${router.params.petID}/approved`,
        {
          params: {
            lastId: approved.tabCursorID ? approved.tabCursorID._id : null,
            limit: limit,
            lastAppUpdate: approved.tabCursorID
              ? approved.tabCursorID.updatedAt
              : null,
          },
        },
      );
      const applicantsArr = res.data.body;

      if (applicantsArr.length < limit) {
        setApproved((prev) => ({ ...prev, hasMore: false }));
      }
      setApproved((prev) => ({
        ...prev,
        applicants: isRefreshing
          ? applicantsArr
          : [...prev.applicants, ...applicantsArr],
        tabCursorID:
          applicantsArr.length > 0
            ? applicantsArr[applicantsArr.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.log(err);
    } finally {
      isFetchingRef.current.approved = false;
      setApproved((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  const fetchRejectedApplicants = async (
    lastCursorID,
    isRefreshing = false,
  ) => {
    isFetchingRef.current.rejected = true;
    setRejected((prev) => ({ ...prev, loading: true }));
    try {
      const limit = rejected.applicants.length === 0 ? initialLimit : 10;
      const res = await api.get(
        `/api/adoptionApp/${router.params.petID}/rejected`,
        {
          params: {
            lastId: rejected.tabCursorID ? rejected.tabCursorID._id : null,
            limit: limit,
            lastAppUpdate: rejected.tabCursorID
              ? rejected.tabCursorID.updatedAt
              : null,
          },
        },
      );
      const applicantsArr = res.data.body;

      if (applicantsArr.length < limit) {
        setRejected((prev) => ({ ...prev, hasMore: false }));
      }
      setRejected((prev) => ({
        ...prev,
        applicants: isRefreshing
          ? applicantsArr
          : [...prev.applicants, ...applicantsArr],
        tabCursorID:
          applicantsArr.length > 0
            ? applicantsArr[applicantsArr.length - 1]
            : prev.tabCursorID,
      }));
    } catch (err) {
      console.log(err);
    } finally {
      isFetchingRef.current.rejected = false;
      setRejected((prev) => ({ ...prev, loading: false, refreshing: false }));
    }
  };

  // Helper to fix the undefined `setApplicants` bug
  const updateLocalState = (updatedApplicantArray) => {
    const updateMap = new Map(
      updatedApplicantArray.map((item) => [item._id, item]),
    );
    const updater = (prev) => ({
      ...prev,
      applicants: prev.applicants.map((item) => {
        if (updateMap.has(item._id)) {
          return { ...item, ...updateMap.get(item._id) };
        }
        return item;
      }),
    });

    if (activeTab === "pending") setPending(updater);
    else if (activeTab === "approved") setApproved(updater);
    else if (activeTab === "rejected") setRejected(updater);
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.post(`api/adoptionApp/${id}/approve`);
      const updatedApplicant = res.data.body;
      updateLocalState(updatedApplicant);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await api.patch(`api/adoptionApp/${id}/reject`);
      const updatedApplicant = res.data.body;
      updateLocalState(updatedApplicant);
    } catch (err) {
      console.log(err);
    }
  };

  const onRefreshPending = useCallback(async () => {
    setPending((prev) => ({
      ...prev,
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
    }));
    await fetchPendingApplicants(null, true);
  }, []);

  const onRefreshApproved = useCallback(async () => {
    setApproved((prev) => ({
      ...prev,
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
    }));
    await fetchApprovedApplicants(null, true);
  }, []);

  const onRefreshRejected = useCallback(async () => {
    setRejected((prev) => ({
      ...prev,
      refreshing: true,
      hasMore: true,
      tabCursorID: null,
    }));
    await fetchRejectedApplicants(null, true);
  }, []);

  const handleLoadMorePending = () => {
    if (!pending.loading && pending.hasMore && !isFetchingRef.current.pending) {
      fetchPendingApplicants(pending.tabCursorID);
    }
  };

  const handleLoadMoreApproved = () => {
    if (
      !approved.loading &&
      approved.hasMore &&
      !isFetchingRef.current.approved
    ) {
      fetchApprovedApplicants(approved.tabCursorID);
    }
  };

  const handleLoadMoreRejected = () => {
    if (
      !rejected.loading &&
      rejected.hasMore &&
      !isFetchingRef.current.rejected
    ) {
      fetchRejectedApplicants(rejected.tabCursorID);
    }
  };

  useEffect(() => {
    fetchPendingApplicants(null, true);
    fetchApprovedApplicants(null, true);
    fetchRejectedApplicants(null, true);
  }, []);

  // Determine current active state for the FlatList
  let currentData, currentRefresh, currentLoadMore;
  if (activeTab === "pending") {
    currentData = pending;
    currentRefresh = onRefreshPending;
    currentLoadMore = handleLoadMorePending;
  } else if (activeTab === "approved") {
    currentData = approved;
    currentRefresh = onRefreshApproved;
    currentLoadMore = handleLoadMoreApproved;
  } else {
    currentData = rejected;
    currentRefresh = onRefreshRejected;
    currentLoadMore = handleLoadMoreRejected;
  }

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
              Pending ({pending.applicants.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "approved" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("approved")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "approved" && styles.activeTabText,
              ]}
            >
              Approved ({approved.applicants.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "rejected" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("rejected")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "rejected" && styles.activeTabText,
              ]}
            >
              Rejected ({rejected.applicants.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* The separating layer for the contents */}
      <View style={styles.contentDivider} />

      {/* Dynamic FlatList based on active tab */}
      <FlatList
        data={currentData.applicants}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ViewApplicantsCard
            adoptionApp={item}
            handleAccept={() => handleAccept(item._id)}
            handleReject={() => handleReject(item._id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={currentData.refreshing}
            onRefresh={currentRefresh}
            tintColor={Themes.COLORS.primary}
          />
        }
        ListEmptyComponent={
          !currentData.loading && (
            <Text style={styles.emptyText}>
              No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
              Applicants Found
            </Text>
          )
        }
        onEndReached={currentLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          currentData.hasMore && currentData.applicants.length > 0 ? (
            <ActivityIndicator
              size="large"
              color={Themes.COLORS.primary}
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
      />
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
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 4,
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
    fontSize: 13, // Slightly reduced to fit 3 tabs perfectly
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
  // --- List Styles ---
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
});
