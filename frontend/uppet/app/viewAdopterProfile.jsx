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
import { useUser } from "../context/UserContext";

export default function ViewAdopterProfile() {
  const router = useRoute();
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );

  const [adopter, setAdopter] = useState({});
  const [adopterRating, setAdopterRating] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingModalMode, setRatingModalMode] = useState("create");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isFetching = useRef(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursorID, setCursorID] = useState(null);

  const { user, newUser } = useUser();
  const currentUserId = user?._id || user?.id;
  const showRatingsAndReviews = !newUser;

  const handleRatingButtonClick = () => {
    setRatingModalMode(myRating ? "edit" : "create");
    setSelectedReview(myRating);
    setRatingModalVisible(true);
  };

  const handleRatingPost = async (score, body) => {
    if (uploading) return;
    setUploading(true);
    try {
      const isEditMode = ratingModalMode === "edit" && selectedReview?._id;
      const res = isEditMode
        ? await api.patch(`/api/rating/${selectedReview._id}`, {
            score,
            body,
          })
        : await api.post(`/api/rating/${adopter._id}`, {
            ratedUser: adopter._id,
            score,
            body,
          });

      if (res?.data?.body) {
        console.log("success in rating");
        setMyRating(res.data.body);
        setSelectedReview(res.data.body);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
      setRatingModalVisible(false);
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

  const handleViewReview = (review) => {
    const isOwnReview =
      review?.reviewer === currentUserId ||
      review?.reviewer?._id === currentUserId;
    setSelectedReview(review);
    setRatingModalMode("view");
    setRatingModalVisible(true);
  };

  const handleEditReviewFromModal = () => {
    setRatingModalMode("edit");
    setSelectedReview(myRating);
  };

  const buttons = [
    ...(showRatingsAndReviews
      ? [
          {
            title: myRating ? "Edit Review" : "Write a Review",
            onPress: handleRatingButtonClick,
            styleType: "neutral",
          },
        ]
      : []),
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
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          fetchRating(cursorID);
        }
      }}
    >
      <ProfileCard
        adopter={adopter}
        myRating={myRating}
        adopterRating={adopterRating}
        reviews={adopterRating}
        reviewsExpanded={reviewsExpanded}
        hasMoreReviews={hasMore}
        onReviewPress={handleViewReview}
        onViewMoreReviews={() => setReviewsExpanded(true)}
        onReviewListEndReached={handleLoadMoreRating}
        onEditReviewPress={handleRatingButtonClick}
        showRatingsAndReviews={showRatingsAndReviews}
      />
      <CreateRatingModal
        visible={ratingModalVisible}
        handleRatingPost={handleRatingPost}
        onClose={() => setRatingModalVisible(false)}
        ratedAdopter={adopter}
        uploading={uploading}
        mode={ratingModalMode}
        review={selectedReview}
        onEditRequest={handleEditReviewFromModal}
        isOwnReview={
          selectedReview &&
          (selectedReview.reviewer === currentUserId ||
            selectedReview.reviewer?._id === currentUserId)
        }
      />
      <View style={styles.buttonSection}>
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
});
