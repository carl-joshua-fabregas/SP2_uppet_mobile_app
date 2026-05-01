import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated, // <-- Add this
} from "react-native";
import { useEffect, useState, useRef } from "react"; // <-- Add useRef
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import * as Themes from "../assets/themes/themes";
import { api } from "../api/axios";
import { useUser } from "../context/UserContext";
export default function ViewPetProfile() {
  const { user } = useUser();
  const route = useRoute();
  const navigation = useNavigation();
  const [status, setStatus] = useState(false);
  const [isOwner, setIsOwner] = useState(
    route?.params?.pet?.ownerId === user._id,
  );
  const [adoptionApp, setAdoptionApp] = useState({});
  const [loading, setLoading] = useState(false);
  const pet = route.params.pet;
  const [gallerySectionLayout, setGallerySectionLayout] = useState({
    y: 0,
    height: 0,
  });
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [placeholderY, setPlaceholderY] = useState(0);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const overlapAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const getstatus = async () => {
    try {
      const res = await api.get(`/api/adoptionApp/${pet._id}/applied`, {});
      console.log("This is the adoption App", res.data);
      if (res.data.body) {
        setStatus(res.data.body.status);
        setAdoptionApp(res.data.body);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleGalleryLayout = (event) => {
    const { y, height } = event.nativeEvent.layout;
    setGallerySectionLayout({ y, height });
  };

  const handleGalleryScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const hasScreenWorthOfSCrolling =
      gallerySectionLayout.height > scrollViewHeight;
    const viewportHeight = event.nativeEvent.layoutMeasurement.height;

    if (hasScreenWorthOfSCrolling && isGalleryExpanded) {
      const stickyThreshold = gallerySectionLayout.y + scrollViewHeight;
      if (currentOffset > stickyThreshold) {
        if (!showStickyButton) setShowStickyButton(true);
      } else {
        if (showStickyButton) setShowStickyButton(false);
      }
    } else {
      if (showStickyButton) setShowStickyButton(false);
    }
  };
  useEffect(() => {
    if (pet._id) {
      getstatus();
    }
  }, [pet._id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showStickyButton ? 1 : 0,
      duration: 250, // 250ms fade
      useNativeDriver: true, // Crucial for performance
    }).start();
  }, [showStickyButton]);
  //   const handleViewGallery = () => {
  //     console.log("HandleViewClicked");
  //   };
  //       <Button title="View Gallery" onPress={handleViewGallery}></Button>

  const handleMessage = async () => {
    console.log("HandleMessageClicked: ", pet.ownerId);
    try {
      const res = await api.get(`/api/chatlist/get/${pet.ownerId}`);
      const chatThreadOrigin = res.data.body;
      if (!chatThreadOrigin)
        console.log("No Chat Thread Origin Yet, sending: ", chatThreadOrigin);

      navigation.navigate("messageScreen", {
        receiverID: pet.ownerId,
        chatThreadOrigin: chatThreadOrigin,
      });
    } catch (err) {
      console.log("ERROR in handling Message", err.message);
    }
  };
  const handleViewOwnerProfile = () => {
    console.log("View Owner Profile Clicked");
    navigation.navigate("viewAdopterProfile", {
      id: pet.ownerId,
    });
  };
  const handleApply = async () => {
    await api.post(`/api/adoptionApp/applied`, {
      petToAdopt: pet._id,
    });
    setStatus("Pending");
    console.log("HandleApplyClicked");
  };

  const handleCancel = async () => {
    await api.delete(`/api/adoptionApp/${pet._id}/cancelled`, {});
    setStatus("Cancelled");
    console.log("HandleCancelClicked");
  };

  const handleViewApplicants = () => {
    console.log("handleViewApplicantsClicked");
    navigation.navigate("viewApplicantsMyAdoptees", {
      petID: pet._id,
    });
  };

  const handleEditPetProfile = () => {
    navigation.navigate("createPetProfile", { editPetData: pet });
  };

  const handleDeletPetProfile = async () => {
    console.log("Handle Delete Profile Clicked");
    try {
      setLoading(true);
      const deletePhotos = await Promise.all(
        pet.photos.map(async (photo) => {
          console.log("Deleting Photo with ID: ", photo._id);

          const presignDeleteUrl = await api.post(`/api/pet/presignDeleteURL`, {
            key: photo.key,
          });
          console.log(
            "Presign URL for Deleting Photo: ",
            presignDeleteUrl.data,
          );

          const { url, key } = presignDeleteUrl.data.body;

          const awsDelete = await fetch(url, {
            method: "DELETE",
          });
          console.log("Status of aws deletion", awsDelete.status);
        }),
      );
      const res = await api.delete(`/api/pet/${pet._id}`, {});
      console.log("Pet deleted successfully", res.status);
    } catch (err) {
      console.log("Error in deleting Pet");
      console.log(err);
    } finally {
      setLoading(false);
      navigation.goBack();
    }
  };

  const buttons = [];
  if (isOwner) {
    buttons.push({
      title: "View Applicants",
      onPress: handleViewApplicants,
      styleType: "calm",
    });
    buttons.push({
      title: "Edit Pet Profile",
      onPress: handleEditPetProfile,
      styleType: "neutral",
    });
    buttons.push({
      title: "Delete Pet Profile",
      onPress: handleDeletPetProfile,
      styleType: "warning",
    });
  } else {
    buttons.push({
      title: "View Owner Profile",
      onPress: handleViewOwnerProfile,
      styleType: "calm",
    });
    buttons.push({
      title: "Message Owner",
      onPress: handleMessage,
      styleType: "neutral",
    });

    const isApplicant = adoptionApp && adoptionApp.applicant === user._id;

    if (isApplicant) {
      if (adoptionApp.status === "Approved") {
        buttons.push({
          title: "Approved", // Changed to past tense for clarity
          disabled: true,
          styleType: "disabled",
        });
      } else if (adoptionApp.status === "Pending") {
        buttons.push({
          title: "Cancel Application",
          onPress: handleCancel,
          styleType: "warning",
        });
      } else if (adoptionApp.status === "Rejected") {
        buttons.push({
          title: "Apply Again",
          onPress: handleApply,
          styleType: "calm",
        });
      }
    } else {
      // User HAS NOT applied yet
      buttons.push({
        title: "Apply",
        onPress: handleApply,
        styleType: "calm",
      });
    }
  }
  const placeholderHeight = 70; // Matches your placeholder's style height
  const bottomOffset = 24; // Matches the stickyWrapper's 'bottom: 24'

  // We only calculate this once both the placeholder and the scroll view have been measured
  const collisionPoint =
    placeholderY > 0 && scrollViewHeight > 0
      ? placeholderY + placeholderHeight - scrollViewHeight + bottomOffset
      : 999999;

  const pushThreshold = Math.max(1, collisionPoint);

  // 3. For every 1 pixel you scroll past the threshold, push the button UP 1 pixel.
  const overlapTranslateY = scrollY.interpolate({
    inputRange: [0, pushThreshold, pushThreshold + 1],
    outputRange: [0, 0, -1],
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
  });
  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)} // <--- ADD THIS LINE
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true,
            listener: handleGalleryScroll,
          },
        )}
      >
        <PetProfileCardViewMore
          pet={route.params.pet}
          isGalleryExpanded={isGalleryExpanded}
          setIsGalleryExpanded={setIsGalleryExpanded}
          handleGalleryLayout={handleGalleryLayout}
        />
        {/* THE PLACEHOLDER: Only shows when gallery is expanded. 
            Give it the approximate height of your sticky button + padding (e.g., 70px) */}
        {isGalleryExpanded && (
          <View
            key={`placeholder-${isGalleryExpanded}`}
            onLayout={(e) => setPlaceholderY(e.nativeEvent.layout.y)}
            style={{ height: 70, width: "100%" }}
          />
        )}

        {/* FIX: Actually rendering the buttons to the screen */}
        <View style={styles.buttonSection}>
          {buttons.map((btn, index) => {
            // Assign styles dynamically based on the styleType defined above
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
      </Animated.ScrollView>
      {/* Notice we removed the {showStickyButton && ...} wrapper so the fade-out animation can play before disappearing visually */}
      <Animated.View
        style={[
          styles.stickyWrapper,
          {
            bottom: Themes.SPACING?.lg || 24,
            opacity: fadeAnim,
            transform: [{ translateY: overlapTranslateY }], // <--- The magic push
          },
        ]}
        pointerEvents={showStickyButton ? "box-none" : "none"}
      >
        <TouchableOpacity
          style={styles.stickyButton}
          onPress={() => {
            // 1. Instantly snap the opacity to 0 (bypasses the 250ms timer)
            fadeAnim.setValue(0);

            // 2. Update the state immediately so the fade out doesn't try to play
            setShowStickyButton(false);

            // 3. Close the gallery as normal
            setIsGalleryExpanded(false);
          }}
        >
          <Text style={styles.stickyButtonText}>Close Gallery</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32, // Padding at the bottom so the last button isn't cut off
    backgroundColor: Themes.COLORS.background,
  },
  buttonSection: {
    marginTop: 16,
    paddingHorizontal: Themes.SPACING?.md || 16, // Added horizontal padding so buttons don't touch screen edges
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  calmButtonContainer: {
    backgroundColor: Themes.COLORS.primary, // Your original Green color
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
    backgroundColor: "#F5F5F5", // A soft gray instead of bright blue
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
    // Removed elevation so it sits flat behind the primary button
  },
  neutralButtonText: {
    color: "#686262", // Dark gray text for readability
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },

  // DESTRUCTIVE ACTION (Cancel / Delete) - Clear, but not overwhelming
  warningButtonContainer: {
    // backgroundColor: "transparent", // Removing the solid red block
    backgroundColor: "#f37270",
    // borderWidth: 1,
    // borderColor: "#EF5350", // Red outline
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButtonText: {
    // color: "#EF5350", // Red text alerts the user without shouting
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
