import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Modal, // <-- Add this
  ActivityIndicator, // <-- Add this
} from "react-native";
import Tombstone from "../component/Tombstone";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes";
import CreateRatingModal from "../component/createRatingModal";
import ViewRatingModal from "../component/viewRatingModal";
import RatingCard from "../component/ratingCard";
import { useUser } from "../context/UserContext";
import ImageView from "react-native-image-viewing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSocket } from "../context/SocketContext";
export default function ViewAdopterProfile({}) {
  const router = useRoute();
  const socket = useSocket();
  const navigation = useNavigation();
  const initialLimit = Math.ceil(
    Dimensions.get("window").height / Themes.TYPOGRAPHY.body.fontSize,
  );
  const { adoptionApp } = router.params;
  const screenHeight = Dimensions.get("window").height;
  const [scrollHeight, setScrollHeight] = useState(0);
  const [placeholderHeight, setPlaceholderHeight] = useState(70);
  const [placeholderY, setPlaceholderY] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const overlapAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets(); // <-- ADDED

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessingApp, setIsProcessingApp] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [ratingSectionLayout, setRatingSectionLayout] = useState({
    y: 0,
    height: 0,
  });
  // New state to track the Y position of the bottom buttons and the overlap calculation
  const [buttonSectionY, setButtonSectionY] = useState(0);

  const handleRatingLayout = (event) => {
    const { y, height } = event.nativeEvent.layout;
    setRatingSectionLayout({ y, height });
  };

  const handleReviewScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    //We try to retrieve when the user is 20percent at the bottom of the rating section
    const dynamicThreshold =
      ratingSectionLayout.y - scrollHeight + ratingSectionLayout.height * 0.2;
    const hasScreenWorthOfScrolling = ratingSectionLayout.height > screenHeight;

    if (currentOffset >= dynamicThreshold && reviewsExpanded) {
      handleLoadMoreRating();
    }

    if (ratingSectionLayout.height > 0 && reviewsExpanded) {
      // NEW: Only show the button if the rating section is taller than the screen

      if (hasScreenWorthOfScrolling) {
        const stickyThreshold = ratingSectionLayout.y + scrollHeight;

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
  };

  const [adopter, setAdopter] = useState({ _id: router.params.id });
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return <Tombstone page="Adopter Profile"></Tombstone>;
  }
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
      const res = await api.delete(`/api/rating/${ratingID}`, {
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

        setAdopterRating((prev) => {
          if (isEditMode) {
            return prev.map((r) =>
              r._id === res.data.body._id ? res.data.body : r,
            );
          } else {
            const exists = prev.find((r) => r._id === res.data.body._id);
            if (exists) return prev;
            return [res.data.body, ...prev]; // Prepend new review
          }
        });
      }
    } catch (err) {
      console.log(err, err.message);
    } finally {
      setUploading(false);
      setCreateModalVisible(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/user/${router.params.id}`);
      if (!res.data.body) {
        setIsDeleted(true);
        return;
      }
      const userData = res.data.body;
      setAdopter(userData);
    } catch (err) {
      // ONLY show the tombstone if the server explicitly says "Not Found"
      if (err.response && err.response.status === 404) {
        setIsDeleted(true);
      } else {
        console.log("Error in getting Profile", err);
      }
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
      if (err.response && err.response.status === 404) {
        setMyRating(null);
      } else {
        console.log("Error fetching my rating", err);
      }
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
      if (err.response && err.response.status === 404) {
        // No more ratings to load
        setHasMore(false);
      } else {
        console.log("Error in fetching Rating", err);
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMyRating();
    fetchRating(null);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showStickyButton ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [reviewsExpanded]);

  useEffect(() => {
    if (!socket) return;
    const handleCreate = (data) => {
      if (adopter._id === data.adopter._id) {
        setAdopter(data.adopter);
      }
    };

    const handleDelete = (data) => {
      if (adopter._id === data.adopter) {
        setIsDeleted(true);
      }
    };

    const handleRatingCreated = (data) => {
      // Check if the new rating belongs to the profile currently being viewed
      if (
        data.rating.ratedUser === adopter._id ||
        data.rating.ratedUser._id === adopter._id
      ) {
        setAdopterRating((prev) => [data.rating, ...prev]);
      }
    };

    const handleRatingUpdated = (data) => {
      // Update the text/score of an existing review without refreshing
      setAdopterRating((prev) =>
        prev.map((rating) =>
          rating._id === data.rating._id ? data.rating : rating,
        ),
      );
    };

    const handleRatingDeleted = (data) => {
      // Magically make the rating vanish from the list
      const deletedRatingId = data.rating._id || data.rating;

      setAdopterRating((prev) =>
        prev.filter((rating) => rating._id !== deletedRatingId),
      );

      // PRO-TIP FIX: Use the functional updater to check the current state safely!
      setMyRating((prevMyRating) => {
        // If the user's rating was the one that got deleted, set it to null
        if (prevMyRating && prevMyRating._id === deletedRatingId) {
          return null;
        }
        // Otherwise, return it exactly as it was (do nothing)
        return prevMyRating;
      });
    };

    socket.on("adopter_created", handleCreate);
    socket.on("adopter_updated", handleCreate);
    socket.on("adopter_deleted", handleDelete);

    socket.on("rating_created", handleRatingCreated);
    socket.on("rating_updated", handleRatingUpdated);
    socket.on("rating_deleted", handleRatingDeleted);

    return () => {
      // Clean up listeners
      socket.off("adopter_created", handleCreate);
      socket.off("adopter_updated", handleCreate);
      socket.off("adopter_deleted", handleDelete);

      socket.off("rating_created", handleRatingCreated);
      socket.off("rating_updated", handleRatingUpdated);
      socket.off("rating_deleted", handleRatingDeleted);
    };
  }, [socket, adopter._id]);
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

  // const buttons = [
  //   {
  //     title: "Accept Application",
  //     onPress: handleAccept,
  //     styleType: "calm",
  //   },
  //   {
  //     title: "Reject Application",
  //     onPress: handleReject,
  //     styleType: "warning",
  //   },
  //   {
  //     title: "Message Applicant",
  //     onPress: handleMessage,
  //     styleType: "neutral",
  //   },
  // ];
  // const handleAccept = async (id) => {
  //     try {
  //       const res = await api.post(`api/adoptionApp/${id}/approve`);
  //       const updatedApplicant = res.data.body;
  //       updateLocalState(updatedApplicant);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   const handleReject = async (id) => {
  //     try {
  //       const res = await api.patch(`api/adoptionApp/${id}/reject`);
  //       const updatedApplicant = res.data.body;
  //       updateLocalState(updatedApplicant);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   const handleMessage = (applicantID) => {
  //     console.log("Messaging applicant with ID:", applicantID);
  //     navigation.navigate("messageScreen", {
  //       receiverID: applicantID,
  //       chatThreadOrigin: null,
  //     });
  //   };

  // 1. These just open the modals
  const handleAccept = () => setShowApproveModal(true);
  const handleReject = () => setShowRejectModal(true);

  // 2. These actually hit the API
  const confirmAccept = async () => {
    setIsProcessingApp(true);
    try {
      await api.post(`api/adoptionApp/${adoptionApp._id}/approve`);
      setShowApproveModal(false);
      navigation.goBack(); // Sends them back to the applicants list to see it move!
    } catch (err) {
      console.log(err);
    } finally {
      setIsProcessingApp(false);
    }
  };

  const confirmReject = async () => {
    setIsProcessingApp(true);
    try {
      await api.patch(`api/adoptionApp/${adoptionApp._id}/reject`);
      setShowRejectModal(false);
      navigation.goBack(); // Sends them back to the applicants list
    } catch (err) {
      console.log(err);
    } finally {
      setIsProcessingApp(false);
    }
  };

  const handleMessage = (entity) => {
    console.log("Messaging applicant with ID:", entity._id);
    navigation.navigate("messageScreen", {
      receiverID: entity._id,
      chatThreadOrigin: null,
      receiverName: `${entity.firstName} ${entity.middleName || ""} ${entity.lastName}`,
    });
  };

  const buttons = [];
  if (adoptionApp && adoptionApp.status === "Pending") {
    buttons.push(
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
    );
  }

  if (adopter._id !== user._id) {
    buttons.push({
      title: "Message Applicant",
      onPress: () => handleMessage(adoptionApp?.applicant || adopter),
      styleType: "neutral",
    });
  } else {
    buttons.push({
      title: "Message Owner",
      onPress: () => handleMessage(adopter),
      styleType: "neutral",
    });
  }

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
  const bottomOffSet = Themes.SPACING?.lg || 24;

  const collissionPoint =
    placeholderHeight > 0 && scrollHeight
      ? placeholderY + placeholderHeight - scrollHeight + bottomOffSet
      : 999999;

  const pushThreshold = Math.max(
    collissionPoint,
    ratingSectionLayout.y + ratingSectionLayout.height,
  );

  const overlapTranslateY = scrollY.interpolate({
    inputRange: [0, pushThreshold, pushThreshold + 1],
    outputRange: [0, 0, -1],
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  useLayoutEffect(() => {
    navigation.setOptions({
      title: adopter?.firstName
        ? `${adopter.firstName}'s Profile`
        : "Adopter Profile",

      headerTitleStyle: {
        fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
      },
      headerStyle: {
        backgroundColor: Themes.COLORS.background,
      },
      headerShadowVisible: false, // Removes the bottom border line
    });
  }, [navigation, adopter]);
  return (
    <View style={{ flex: 1 }}>
      <ViewRatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible((prev) => !prev)}
        review={selectedReview}
      ></ViewRatingModal>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: (Themes.SPACING?.xl || 32) + insets.bottom }, // <-- Add inset here
        ]}
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
          setShowImageViewer={setShowImageViewer}
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
        {reviewsExpanded && (
          <View
            key={`placeholder-${reviewsExpanded}`} // Force re-layout when reviews are expanded
            onLayout={(e) => setPlaceholderY(e.nativeEvent.layout.y)}
            style={{ height: placeholderHeight, width: "100%" }}
          />
        )}
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
        <Animated.View
          style={[
            styles.stickyWrapper,
            {
              bottom: (Themes.SPACING?.lg || 24) + insets.bottom,
              opacity: fadeAnim,
              transform: [{ translateY: overlapTranslateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.stickyButton}
            onLayout={(e) =>
              setPlaceholderHeight(
                e.nativeEvent.layout.height + Themes.SPACING?.xs || 8,
              )
            }
            onPress={() => {
              fadeAnim.setValue(0);
              setShowStickyButton(false);
              setReviewsExpanded(false);
            }}
          >
            <Text style={styles.stickyButtonText}>Close Rating</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <ImageView
        images={
          adopter?.profilePhoto?.url ? [{ uri: adopter.profilePhoto.url }] : []
        }
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
      {/* APPROVE CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showApproveModal}
        onRequestClose={() => {
          if (!isProcessingApp) setShowApproveModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cuteModalCard}>
            {isProcessingApp ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={Themes.COLORS.primary} />
                <Text style={[styles.modalTitle, { marginTop: 16 }]}>
                  Approving...
                </Text>
                <Text style={styles.modalText}>
                  Making it official! Please wait.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={50}
                    color={Themes.COLORS.primary}
                  />
                </View>

                <Text style={styles.modalTitle}>Approve Application?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to approve this applicant? They will be
                  granted ownership!
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => setShowApproveModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: Themes.COLORS.primary },
                    ]}
                    onPress={confirmAccept}
                  >
                    <Text style={styles.modalDeleteText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* REJECT CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRejectModal}
        onRequestClose={() => {
          if (!isProcessingApp) setShowRejectModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cuteModalCard}>
            {isProcessingApp ? (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator size="large" color="#f37270" />
                <Text style={[styles.modalTitle, { marginTop: 16 }]}>
                  Rejecting...
                </Text>
                <Text style={styles.modalText}>
                  Please wait while we process this.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="close-octagon-outline"
                    size={50}
                    color="#f37270"
                  />
                </View>

                <Text style={styles.modalTitle}>Reject Application?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to reject this application? You can
                  always reconsider later.
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => setShowRejectModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDeleteBtn]}
                    onPress={confirmReject}
                  >
                    <Text style={styles.modalDeleteText}>Reject</Text>
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
