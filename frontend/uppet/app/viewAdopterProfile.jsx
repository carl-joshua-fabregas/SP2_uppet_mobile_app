import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes";
import CreateRatingModal from "../component/createRatingModal";
import ViewRatingModal from "../component/viewRatingModal";
import RatingCard from "../component/ratingCard";
import { useUser } from "../context/UserContext";

export default function ViewAdopterProfile() {
  const router = useRoute();
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );
  const screenHeight = Dimensions.get("window").height;

  const [showStickyButton, setShowStickyButton] = useState(false);
  const [ratingSectionLayout, setRatingSectionLayout] = useState({
    y: 0,
    height: 0,
  });
  // New state to track the Y position of the bottom buttons and the overlap calculation
  const [buttonSectionY, setButtonSectionY] = useState(0);
  const [overlapDelta, setOverlapDelta] = useState(0);

  const handleRatingLayout = (event) => {
    const { y, height } = event.nativeEvent.layout;
    setRatingSectionLayout({ y, height });
  };

  const handleReviewScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;
    //We try to retrieve when the user is 20percent at the bottom of the rating section
    const dynamicThreshold =
      ratingSectionLayout.y - screenHeight + ratingSectionLayout.height * 0.2;

    if (currentOffset >= dynamicThreshold && reviewsExpanded) {
      handleLoadMoreRating();
    }

    if (ratingSectionLayout.height > 0 && reviewsExpanded) {
      // NEW: Only show the button if the rating section is taller than the screen
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
        // Force hide if the section is too short
        if (showStickyButton) setShowStickyButton(false);
      }
    }

    if (buttonSectionY > 0 && reviewsExpanded) {
      const viewportBottom = currentOffset + viewportHeight;
      const calculatedDelta =
        viewportBottom > buttonSectionY ? viewportBottom - buttonSectionY : 0;

      // OPTIMIZATION 2: Throttle the state update.
      // Only re-render if the button needs to move by more than 3 pixels,
      // OR if it needs to snap cleanly back to 0.
      if (
        Math.abs(overlapDelta - calculatedDelta) > 3 ||
        (calculatedDelta === 0 && overlapDelta !== 0)
      ) {
        setOverlapDelta(calculatedDelta);
      }
    }
  };

  const [adopter, setAdopter] = useState({});
  const [adopterRating, setAdopterRating] = useState([]);

  const [myRating, setMyRating] = useState(null);
  const [createMode, setCreateMode] = useState(true);

  //Made for the modal viewing
  const [selectedReview, setSelectedReview] = useState({});
  const [ratingModalVisible, setRatingModalVisible] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursorID, setCursorID] = useState(null);

  const { user, newUser } = useUser();
  const currentUserId = user?._id;
  const showRatingsAndReviews = !newUser;

  const handleMyRatingClick = () => {
    setCreateMode(myRating ? true : false);
    setSelectedReview(myRating);
    setRatingModalVisible(true);
  };

  const handleRatingDelete = async (ratingID) => {
    try {
      const res = await api.delete(`/api/rating/delete`, {
        params: {
          ratingID: ratingID,
        },
      });
      console.log("Successfully deleted");
    } catch (err) {
      console.log("Was not successful in the deletion");
    } finally {
      setCreateModalVisible(false);
      setSelectedReview({});
      setMyRating(null);
    }
  };

  const handleRatingSubmit = async (score, body, isAnonymous) => {
    if (uploading) return;
    setUploading(true);
    try {
      const isEditMode = myRating ? true : false;
      console.log(isEditMode);
      const res = isEditMode
        ? await api.patch(`/api/rating/${selectedReview._id}`, {
            score,
            body,
            isAnonymous,
          })
        : await api.post(`/api/rating/${adopter._id}`, {
            ratedUser: adopter._id,
            score,
            body,
            isAnonymous,
          });

      if (res?.data?.body) {
        console.log("success in rating");
        setMyRating(res.data.body);
        setSelectedReview(res.data.body);
      }
    } catch (err) {
      console.log(err, err.message);
    } finally {
      setUploading(false);
      setCreateModalVisible(false);
    }
  };

  const handleAccept = () => {
    console.log("Accept applicant clicked");
  };

  const handleReject = () => {
    console.log("Reject applicant clicked");
  };

  const handleMessage = () => {
    console.log("Message applicant clicked");
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/user/${router.params.id}`);
      const userData = res.data.body;
      setAdopter(userData);
      console.log("Successfully obtained Adopter Profile");
    } catch (err) {
      console.log("Error in getting Profile", err);
    }
  };

  const fetchMyRating = async () => {
    try {
      const myRatingRes = await api.get(
        `/api/rating/myRating/${router.params.id}`,
      );
      const rating = myRatingRes.data.body;
      setMyRating(rating && rating._id ? rating : null);
    } catch (err) {
      console.log("Error fetching my rating", err);
    }
  };

  const fetchRating = async (lastRatingID = null) => {
    isFetching.current = true;
    setLoading(true);
    try {
      const limit = adopterRating.length > 0 ? 10 : initialLimit;
      const otherRatingRes = await api.get(
        `/api/rating/otherRatings/${router.params.id}`,
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
    fetchProfile();
    fetchMyRating();
    fetchRating(null);
  }, [router.params.id]);

  const handleLoadMoreRating = async () => {
    if (!loading && hasMore && !isFetching.current) {
      await fetchRating(cursorID);
    }
  };

  // const handleViewReview = (review) => {
  //   const isOwnReview =
  //     review?.reviewer === currentUserId ||
  //     review?.reviewer?._id === currentUserId;
  //   setSelectedReview(review);
  //   setCreateMode("view");
  //   setRatingModalVisible(true);
  // };

  const handleEditReviewFromModal = () => {
    setCreateMode(false);
    setSelectedReview(myRating);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setRatingModalVisible(true);
  };

  const handleCreateReview = (myReview) => {
    setSelectedReview(myReview);
    setCreateModalVisible(true);
  };

  const buttons = [
    {
      title: "Accept Application",
      onPress: handleAccept,
      styleType: "calm",
    },
    {
      title: "Reject Application",
      onPress: handleReject,
      styleType: "warning",
    },
    {
      title: "Message Applicant",
      onPress: handleMessage,
      styleType: "neutral",
    },
  ];
  const isCloseToBottom = ({
    layoutMeasurement,
    contentOffset,
    contentSize,
  }) => {
    const paddingToBottom = 20; // px from bottom to trigger
    return (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ViewRatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible((prev) => !prev)}
        review={selectedReview}
      ></ViewRatingModal>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        onScroll={(e) => handleReviewScroll(e)}
        scrollEventThrottle={16}
      >
        <ProfileCard
          adopter={adopter}
          myRating={myRating}
          adopterRating={adopterRating}
          reviews={adopterRating}
          reviewsExpanded={reviewsExpanded}
          onReviewPress={handleViewReview}
          showRatingsAndReviews={showRatingsAndReviews}
          hasMoreReviews={hasMore}
          onViewMoreReviews={() => setReviewsExpanded(true)}
          onCreateRatingPress={handleCreateReview}
          handleRatingLayout={handleRatingLayout}
        />

        <CreateRatingModal
          visible={createModalVisible}
          handleRatingSubmit={handleRatingSubmit}
          onClose={() => setCreateModalVisible((prev) => !prev)}
          ratedAdopter={adopter}
          uploading={uploading}
          review={myRating}
          onEditRequest={handleEditReviewFromModal}
          handleRatingDelete={handleRatingDelete}
        />
        <View
          style={styles.buttonSection}
          onLayout={(e) => setButtonSectionY(e.nativeEvent.layout.y)}
        >
          {buttons.map((btn, index) => {
            const containerStyle =
              btn.styleType === "warning"
                ? styles.warningButtonContainer
                : btn.styleType === "neutral"
                  ? styles.neutralButtonContainer
                  : styles.calmButtonContainer;

            const textStyle =
              btn.styleType === "warning"
                ? styles.warningButtonText
                : btn.styleType === "neutral"
                  ? styles.neutralButtonText
                  : styles.calmButtonText;

            return (
              <TouchableOpacity
                key={index}
                style={containerStyle}
                onPress={btn.onPress}
              >
                <Text style={textStyle}>{btn.title}</Text>
              </TouchableOpacity>
            );
          })}
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
            onPress={() => {
              setReviewsExpanded(false);
            }}
          >
            <Text style={styles.stickyButtonText}>Quick Action</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32,
    backgroundColor: Themes.COLORS.background,
  },
  buttonSection: {
    marginTop: Themes.SPACING?.lg || 16,
    paddingHorizontal: Themes.SPACING?.md || 16,
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  calmButtonContainer: {
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calmButtonText: {
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
  stickyWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center", // Centers the button horizontally
    zIndex: 999,
  },
  stickyButton: {
    backgroundColor: Themes.COLORS.primary || "#007BFF",
    paddingVertical: Themes.SPACING?.md || 14,
    paddingHorizontal: Themes.SPACING?.lg || 32, // Widened slightly for better aesthetics
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
