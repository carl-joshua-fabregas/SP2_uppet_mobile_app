import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Switch, // <-- Added Switch import
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";
import { useUser } from "../context/UserContext";

export default function CreateRatingModal({
  visible,
  onClose,
  ratedAdopter,
  handleRatingSubmit,
  handleRatingDelete,
  uploading,
  review = null,
}) {
  const { user } = useUser();
  const [rating, setRating] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false); // <-- Added state for anonymous toggle
  const [editButtonPressed, setEditButtonPressed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwnReview = user?.id === review?.reviewer?._id;

  useEffect(() => {
    if (visible) {
      setRating(review?.score ?? 0);
      setReviewBody(review?.body ?? "");
      setIsAnonymous(review?.isAnonymous ?? false); // <-- Reset or set from existing review
      setShowMenu(false);
    }
  }, [visible, review]);

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const onSubmit = async () => {
    if (handleRatingSubmit) {
      // <-- Pass isAnonymous to the submit handler
      await handleRatingSubmit(rating, reviewBody, isAnonymous);
    }
    setRating(0);
    setReviewBody("");
    setIsAnonymous(false);
  };

  const onDelete = async () => {
    setShowMenu(false);
    if (handleRatingDelete) {
      await handleRatingDelete(review?._id);
    }
  };

  const title = review ? `Edit Review` : `Rate ${ratedAdopter?.firstName}`;
  const subtitle = !editButtonPressed
    ? `Read the full review`
    : "How was your experience with them";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowMenu(false)}
      >
        <TouchableOpacity activeOpacity={1} style={styles.cardContainer}>
          {/* --- THREE DOTS MENU --- */}
          {isOwnReview && review && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuIcon}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={24}
                  color={Themes.COLORS.textDark}
                />
              </TouchableOpacity>

              {showMenu && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                  >
                    <Ionicons name="trash-outline" size={18} color="red" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          {/* ----------------------- */}

          <View style={styles.headerContainer}>
            <Image
              source={
                ratedAdopter?.profilePhoto
                  ? { uri: ratedAdopter.profilePhoto.url }
                  : require("../assets/images/doggoe.jpg")
              }
              style={styles.profileImage}
            />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          {/* --- ANONYMOUS TOGGLE --- */}
          {editButtonPressed && (
            <View style={styles.anonymousContainer}>
              <Text style={styles.anonymousText}>Post Anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: "#d3d3d3", true: Themes.COLORS.primary }}
                thumbColor={"#ffffff"}
              />
            </View>
          )}
          {/* ----------------------- */}

          {!editButtonPressed ? (
            <View style={styles.contentContainer}>
              <View style={styles.starSummaryContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={
                      star <= (review?.score ?? 0) ? "star" : "star-outline"
                    }
                    size={36}
                    color={Themes.COLORS.primary}
                    style={styles.starIcon}
                  />
                ))}
              </View>
              <Text style={styles.reviewText}>
                {review?.body || "No review text available."}
              </Text>
              <Text style={styles.metaText}>
                {review?.isAnonymous
                  ? "Anonymous reviewer"
                  : review?.reviewer?.firstName
                    ? `Reviewed by ${review.reviewer.firstName}`
                    : "Anonymous reviewer"}
              </Text>
              {review?.createdAt && (
                <Text style={styles.metaText}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.contentContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={Themes.COLORS.primary}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Write your review here..."
                placeholderTextColor={Themes.COLORS.textDark + "80"}
                multiline
                numberOfLines={4}
                value={reviewBody}
                onChangeText={setReviewBody}
              />
            </View>
          )}

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>
                {!editButtonPressed ? "Close" : "Cancel"}
              </Text>
            </TouchableOpacity>

            {!editButtonPressed ? (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => setEditButtonPressed(true)}
              >
                <Text style={styles.submitButtonText}>Edit Review</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating === 0 || uploading) && styles.submitButtonDisabled,
                ]}
                onPress={onSubmit}
                disabled={rating === 0 || uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={Themes.COLORS.card} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {review ? "Update" : "Submit"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Themes.SPACING.md,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  menuContainer: {
    position: "absolute",
    top: Themes.SPACING.md,
    right: Themes.SPACING.md,
    zIndex: 10,
  },
  menuIcon: {
    padding: 4,
  },
  dropdownMenu: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.sm,
    padding: Themes.SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 100,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "red",
    borderRadius: Themes.RADIUS.sm,
    backgroundColor: "rgba(255, 0, 0, 0.05)",
  },
  deleteButtonText: {
    color: "red",
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: Themes.SPACING.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
  },
  title: {
    fontSize: Themes.TYPOGRAPHY.heading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.textDark,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    opacity: 0.8,
    textAlign: "center",
  },
  /* --- Added Anonymous Styles --- */
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Themes.SPACING.md,
    gap: Themes.SPACING.sm,
  },
  anonymousText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textDark,
  },
  /* ------------------------------ */
  contentContainer: {
    marginBottom: Themes.SPACING.lg,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Themes.SPACING.lg,
    gap: Themes.SPACING.sm,
  },
  starSummaryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Themes.SPACING.lg,
    gap: Themes.SPACING.sm,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  textInput: {
    backgroundColor: Themes.COLORS.background,
    borderRadius: Themes.RADIUS.sm,
    padding: Themes.SPACING.md,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textDark,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Themes.COLORS.soft,
  },
  reviewText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    lineHeight: 20,
    marginBottom: Themes.SPACING.sm,
    textAlign: "center",
  },
  metaText: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.textMuted,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Themes.SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.sm,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    color: "#686262",
  },
  submitButton: {
    flex: 1,
    paddingVertical: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.sm,
    backgroundColor: Themes.COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: Themes.COLORS.soft,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    color: Themes.COLORS.card,
  },
});
