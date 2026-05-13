import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes.js";
import ViewRatingModal from "../component/viewRatingModal";
import ImageView from "react-native-image-viewing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSocket } from "../context/SocketContext.js";
export default function AdopterProfile() {
  const socket = useSocket();
  const { user, logout } = useUser();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );
  const screenHeight = Dimensions.get("window").height;

  const [showStickyButton, setShowStickyButton] = useState(false);
  const [ratingSectionLayout, setRatingSectionLayout] = useState({
    y: 0,
    height: 0,
  });
  const [buttonSectionY, setButtonSectionY] = useState(0);
  const [overlapDelta, setOverlapDelta] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  // --- Ratings State ---
  const [adopterRating, setAdopterRating] = useState([]);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState({});

  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursorID, setCursorID] = useState(null);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  // --- Existing Profile Handlers ---
  const handleEditing = () => {
    navigation.navigate("createAdopterProfile");
  };

  const handleSignOut = () => {
    logout();
  };

  const handleDeleteProfile = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const presignURL = await api.post(`/api/user/presignDeleteURL`, {
        key: user.profilePhoto.key,
      });

      const { url } = presignURL.data.body;

      const awsDelRes = await fetch(url, {
        method: "DELETE",
      });

      console.log("DID WE DELETE THE PROFILE", awsDelRes.ok);

      const deleteProfileRes = await api.delete(`/api/user/delete`);
      console.log(
        "Did we succeed?",
        deleteProfileRes.status,
        deleteProfileRes.data.message,
      );
    } catch (err) {
      console.log("Error in deleting Profile", err.message);
      setLoading(false);
      setShowDeleteModal(false); // Close modal if it fails so they aren't stuck
    } finally {
      setLoading(false);
      logout(); // This handles logging them out / navigating away
    }
  };

  // --- Scroll & Layout Handlers ---
  const handleRatingLayout = (event) => {
    const { y, height } = event.nativeEvent.layout;
    setRatingSectionLayout({ y, height });
  };

  const handleReviewScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;

    const dynamicThreshold =
      ratingSectionLayout.y - screenHeight + ratingSectionLayout.height * 0.2;

    if (currentOffset >= dynamicThreshold && reviewsExpanded) {
      handleLoadMoreRating();
    }

    if (ratingSectionLayout.height > 0 && reviewsExpanded) {
      const hasScreenWorthOfScrolling =
        ratingSectionLayout.height > screenHeight;

      if (hasScreenWorthOfScrolling) {
        const stickyThreshold = ratingSectionLayout.y;

        if (currentOffset > stickyThreshold) {
          if (!showStickyButton) setShowStickyButton(true);
        } else {
          if (showStickyButton) setShowStickyButton(false);
        }
      } else {
        if (showStickyButton) setShowStickyButton(false);
      }
    }

    if (buttonSectionY > 0 && reviewsExpanded) {
      const viewportBottom = currentOffset + viewportHeight;
      const calculatedDelta =
        viewportBottom > buttonSectionY ? viewportBottom - buttonSectionY : 0;

      if (
        Math.abs(overlapDelta - calculatedDelta) > 3 ||
        (calculatedDelta === 0 && overlapDelta !== 0)
      ) {
        setOverlapDelta(calculatedDelta);
      }
    }
  };

  // --- Fetching Ratings Logic ---
  const fetchRating = async (lastRatingID = null) => {
    if (!user?._id) return;

    isFetching.current = true;
    setLoading(true);
    try {
      const limit = adopterRating.length > 0 ? 10 : initialLimit;
      const otherRatingRes = await api.get(
        `/api/rating/otherRatings/${user._id}`,
        {
          params: {
            limit,
            lastRatingID,
          },
        },
      );
      const otherRating = Array.isArray(otherRatingRes.data.body)
        ? otherRatingRes.data.body
        : [];

      setAdopterRating((prev) => [...prev, ...otherRating]);
      setHasMore(otherRating.length >= limit);

      if (otherRating.length > 0) {
        setCursorID(otherRating[otherRating.length - 1]._id);
      }
    } catch (err) {
      console.log("Error in fetching Rating", err);
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchRating(null);
    }
    navigation.setOptions({
      headerTitle: "My Profile",
      headerTitleAlign: "center",
    });
  }, [user?._id]);
  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleRatingCreated = (data) => {
      // Check if the new rating belongs to the logged-in user
      if (
        data.rating.ratedUser === user._id ||
        data.rating.ratedUser._id === user._id
      ) {
        setAdopterRating((prev) => [data.rating, ...prev]);
      }
    };

    const handleRatingUpdated = (data) => {
      setAdopterRating((prev) =>
        prev.map((rating) =>
          rating._id === data.rating._id ? data.rating : rating,
        ),
      );
    };

    const handleRatingDeleted = (data) => {
      const deletedRatingId = data.rating._id || data.rating;
      setAdopterRating((prev) =>
        prev.filter((rating) => rating._id !== deletedRatingId),
      );
    };

    // Attach listeners
    socket.on("rating_created", handleRatingCreated);
    socket.on("rating_updated", handleRatingUpdated);
    socket.on("rating_deleted", handleRatingDeleted);

    return () => {
      // Clean up listeners
      socket.off("rating_created", handleRatingCreated);
      socket.off("rating_updated", handleRatingUpdated);
      socket.off("rating_deleted", handleRatingDeleted);
    };
  }, [socket, user?._id]);
  const handleLoadMoreRating = async () => {
    if (!loading && hasMore && !isFetching.current) {
      await fetchRating(cursorID);
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setRatingModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ViewRatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible((prev) => !prev)}
        review={selectedReview}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleReviewScroll}
        scrollEventThrottle={16}
      >
        <ProfileCard
          adopter={user}
          isOwner={true}
          handleEditing={handleEditing}
          adopterRating={adopterRating}
          reviews={adopterRating}
          reviewsExpanded={reviewsExpanded}
          onReviewPress={handleViewReview}
          showRatingsAndReviews={true}
          hasMoreReviews={hasMore}
          onViewMoreReviews={() => setReviewsExpanded(true)}
          handleRatingLayout={handleRatingLayout}
          setShowImageViewer={setShowImageViewer}
        />
        <View
          style={styles.buttonSection}
          onLayout={(e) => setButtonSectionY(e.nativeEvent.layout.y)}
        >
          <TouchableOpacity
            style={styles.neutralButtonContainer}
            onPress={handleSignOut}
          >
            <Text style={styles.neutralButtonText}> Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.warningButtonContainer}
            onPress={handleDeleteProfile}
          >
            <Text style={styles.warningButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* STICKY BUTTON COMPONENT */}
      {showStickyButton && (
        <View
          style={[
            styles.stickyWrapper,
            { bottom: (Themes.SPACING?.lg || 24) + overlapDelta },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.stickyButton}
            onPress={() => setReviewsExpanded(false)}
          >
            <Text style={styles.stickyButtonText}>Quick Action</Text>
          </TouchableOpacity>
        </View>
      )}
      <ImageView
        images={user?.profilePhoto?.url ? [{ uri: user.profilePhoto.url }] : []}
        visible={showImageViewer}
        onRequestClose={() => setShowImageViewer(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
        HeaderComponent={() => (
          <View
            style={[
              styles.viewerHeaderContainer,
              { marginTop: insets.top || 40 },
            ]}
          >
            <TouchableOpacity
              style={styles.customCloseButton}
              onPress={() => setShowImageViewer(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      />
      {/* CUTE DELETE CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => {
          if (!loading) setShowDeleteModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cuteModalCard}>
            {loading ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={Themes.COLORS.primary} />
                <Text style={[styles.modalTitle, { marginTop: 16 }]}>
                  Saying Goodbye...
                </Text>
                <Text style={styles.modalText}>
                  Please wait while we delete your account.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="emoticon-sad-outline"
                    size={50}
                    color={Themes.COLORS.primary}
                  />
                  <MaterialCommunityIcons
                    name="help"
                    size={24}
                    color={Themes.COLORS.primary}
                    style={styles.questionMark}
                  />
                </View>

                <Text style={styles.modalTitle}>Delete Account?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to delete your profile? This can't be
                  undone!
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Keep Account</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDeleteBtn]}
                    onPress={confirmDelete}
                  >
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonSection: {
    marginTop: Themes.SPACING?.lg || 16,
    paddingHorizontal: Themes.SPACING?.md || 16,
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32,
    backgroundColor: Themes.COLORS.background,
  },
  warningButtonContainer: {
    backgroundColor: "#f37270",
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
  neutralButtonContainer: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  neutralButtonText: {
    color: "#686262",
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
  stickyWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  stickyButton: {
    backgroundColor: Themes.COLORS.primary || "#007BFF",
    paddingVertical: Themes.SPACING?.md || 14,
    paddingHorizontal: Themes.SPACING?.lg || 32,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stickyButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY?.body?.fontSize || 14,
    fontFamily: Themes.TYPOGRAPHY?.body?.fontFamily,
    fontWeight: "bold",
    textAlign: "center",
  },
  viewerHeaderContainer: {
    width: "100%",
    position: "absolute",
    zIndex: 1,
  },
  customCloseButton: {
    alignSelf: "flex-end",
    marginRight: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cuteModalCard: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    width: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalIconContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  questionMark: {
    position: "absolute",
    right: -15,
    top: -5,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    backgroundColor: Themes.COLORS.soft,
  },
  modalCancelText: {
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontWeight: "600",
    fontSize: 16,
  },
  modalDeleteBtn: {
    backgroundColor: "#f37270",
  },
  modalDeleteText: {
    color: "#fff",
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontWeight: "600",
    fontSize: 16,
  },
});
