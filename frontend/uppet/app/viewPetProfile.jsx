import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import * as Themes from "../assets/themes/themes";
import { api } from "../api/axios";
import { useUser } from "../context/UserContext";

import ImageView from "react-native-image-viewing";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ViewPetProfile() {
  const { user } = useUser();
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [status, setStatus] = useState(false);
  const [isOwner, setIsOwner] = useState(
    route?.params?.pet?.ownerId === user._id,
  );
  const [placeholderHeight, setPlaceholderHeight] = useState(70);
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

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
    navigation.setOptions({
      headerTitle: `${pet.name}'s Profile`,
    });
  }, [pet._id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showStickyButton ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [showStickyButton]);

  // --- NEW HANDLER FOR IMAGE PRESS ---
  const handlePressImage = (image, index) => {
    console.log("Image Pressed: ", image, index);
    setSelectedImage(image);
    setImageViewerIndex(index);
    setShowImageViewer(true);
  };

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
    try {
      if (adoptionApp) {
        const res = await api.patch(
          `/api/adoptionApp/${adoptionApp._id}/reapply`,
          {
            petToAdopt: pet._id,
          },
        );
        console.log("Reapply Response: ", res.data);
        setStatus("Pending");
      } else {
        await api.post(`/api/adoptionApp/applied`, {
          petToAdopt: pet._id,
        });
        setStatus("Pending");
      }
    } catch (err) {
      console.log("Error in handle Apply: ", err);
    }
  };

  //Update this shi not delete this shit, we need to set the status to cancelled and not delete the application because we want to keep the record of the application for future reference and analytics. Deleting the application would remove all history and data associated with it, which could be valuable for understanding user behavior and improving the adoption process. By setting the status to cancelled, we can maintain a complete record of all applications while still allowing users to manage their applications effectively.
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

  const handleDeletPetProfile = () => {
    console.log("Handle Delete Profile Clicked");
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const deletePhotos = await Promise.all(
        pet.photos.map(async (photo) => {
          const presignDeleteUrl = await api.post(`/api/pet/presignDeleteURL`, {
            key: photo.key,
          });
          const { url } = presignDeleteUrl.data.body;
          await fetch(url, { method: "DELETE" });
        }),
      );
      await api.delete(`/api/pet/${pet._id}`, {});
    } catch (err) {
      console.log("Error in deleting Pet", err);
      setLoading(false);
      setShowDeleteModal(false);
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
          title: "Approved",
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
      buttons.push({
        title: "Apply",
        onPress: handleApply,
        styleType: "calm",
      });
    }
  }

  const bottomOffset = Themes.SPACING?.lg || 24;
  const collisionPoint =
    placeholderY > 0 && scrollViewHeight > 0
      ? placeholderY + placeholderHeight - scrollViewHeight + bottomOffset
      : 999999;

  const pushThreshold = Math.max(1, collisionPoint);

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
        onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}
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
          handlePressImage={handlePressImage} // <-- ADDED PROP
        />

        {isGalleryExpanded && (
          <View
            key={`placeholder-${isGalleryExpanded}`}
            onLayout={(e) =>
              setPlaceholderY(e.nativeEvent.layout.y + Themes.SPACING?.xs || 8)
            }
            style={{ height: placeholderHeight, width: "100%" }}
          />
        )}

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
      </Animated.ScrollView>

      <Animated.View
        style={[
          styles.stickyWrapper,
          {
            bottom: Themes.SPACING?.lg || 24,
            opacity: fadeAnim,
            transform: [{ translateY: overlapTranslateY }],
          },
        ]}
        pointerEvents={showStickyButton ? "box-none" : "none"}
      >
        <TouchableOpacity
          style={styles.stickyButton}
          onLayout={(e) =>
            setPlaceholderHeight(
              e.nativeEvent.layout.height + Themes.SPACING.xs,
            )
          }
          onPress={() => {
            fadeAnim.setValue(0);
            setShowStickyButton(false);
            setIsGalleryExpanded(false);
          }}
        >
          <Text style={styles.stickyButtonText}>Close Gallery</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* --- NEW MODAL FOR IMAGE VIEWER --- */}
      <ImageView
        images={
          selectedImage
            ? !Array.isArray(selectedImage)
              ? [{ uri: selectedImage.url }]
              : selectedImage.map((img) => ({ uri: img.url }))
            : []
        }
        imageIndex={imageViewerIndex}
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
          if (!loading) setShowDeleteModal(false); // Prevent closing while loading
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cuteModalCard}>
            {loading ? (
              // --- WHAT SHOWS WHILE DELETING ---
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <ActivityIndicator size="large" color={Themes.COLORS.primary} />
                <Text style={[styles.modalTitle, { marginTop: 16 }]}>
                  Saying Goodbye...
                </Text>
                <Text style={styles.modalText}>
                  Please wait while we pack up {pet.name}'s things.
                </Text>
              </View>
            ) : (
              // --- THE ORIGINAL CONFIRMATION UI ---
              <>
                <View style={styles.modalIconContainer}>
                  <MaterialCommunityIcons
                    name="dog"
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

                <Text style={styles.modalTitle}>Say Goodbye?</Text>
                <Text style={styles.modalText}>
                  Are you sure you want to delete {pet.name}'s profile? This
                  can't be undone!
                </Text>

                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => setShowDeleteModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Keep Pet</Text>
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
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32,
    backgroundColor: Themes.COLORS.background,
  },
  buttonSection: {
    marginTop: 16,
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
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Dim the background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cuteModalCard: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: 24, // Extra round for cuteness
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
    backgroundColor: "#f37270", // Your warning color
  },
  modalDeleteText: {
    color: "#fff",
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontWeight: "600",
    fontSize: 16,
  },
});
