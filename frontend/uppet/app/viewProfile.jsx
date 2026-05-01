import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes.js";
import ViewRatingModal from "../component/viewRatingModal";

export default function AdopterProfile() {
  const { user, logout } = useUser();
  const navigation = useNavigation();

  // --- Sizing & Layout State ---
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

  // --- Ratings State ---
  const [adopterRating, setAdopterRating] = useState([]);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState({});

  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursorID, setCursorID] = useState(null);

  // --- Existing Profile Handlers ---
  const handleEditing = () => {
    navigation.navigate("createAdopterProfile");
  };

  const handleSignOut = () => {
    logout();
  };

  const handleDeleteProfile = async () => {
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
    } finally {
      logout();
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
  }, [user?._id]);

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
});
