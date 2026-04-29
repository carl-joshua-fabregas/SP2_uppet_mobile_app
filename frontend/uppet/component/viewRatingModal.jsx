import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

// Removed the default = {} here, we will handle it safely below
export default function ViewRatingModal({ visible, onClose, review }) {
  const [expanded, setExpanded] = useState(false);

  // 1. Safe fallback: If review is null or undefined, default to an empty object
  const safeReview = review || {};
  const reviewer = safeReview.reviewer || {};

  // 2 & 3. Fixed spelling (isAnonymous) and swapped the logic so Anonymous hides the name
  const name = safeReview.isAnonymous
    ? "Anonymous"
    : `${reviewer.firstName || "Unknown"}${reviewer.lastName ? ` ${reviewer.lastName}` : ""}`;

  const score = typeof safeReview.score === "number" ? safeReview.score : 0;

  const avatarSource = reviewer.profilePhoto?.url
    ? { uri: reviewer.profilePhoto.url }
    : require("../assets/images/doggoe.jpg");

  const isExpandable =
    !!safeReview.body &&
    (safeReview.body.split("\n").length > 4 || safeReview.body.length > 240);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => null}>
          <View style={styles.topRow}>
            <View style={styles.reviewerRow}>
              <Image source={avatarSource} style={styles.avatar} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{name}</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Ionicons
                      key={item}
                      name={item <= Math.round(score) ? "star" : "star-outline"}
                      size={14}
                      color={Themes.COLORS.primary}
                      style={styles.starIcon}
                    />
                  ))}
                  <Text style={styles.ratingValue}>{score.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            {/* Grouped Quote and Close Button here */}
            <View style={styles.topRightControls}>
              <View style={styles.quoteContainer}>
                <Text style={styles.quoteIcon}>”</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={22}
                  color={Themes.COLORS.textDark}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            style={styles.bodyCard}
            onPress={() => setExpanded((prev) => !prev)}
          >
            <Text
              style={styles.bodyText}
              numberOfLines={expanded ? undefined : 4}
            >
              {safeReview.body || "No review details available."}
            </Text>
            {isExpandable ? (
              <Text style={styles.expandText}>
                {expanded ? "Tap to collapse" : "Tap to read more"}
              </Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(29, 59, 46, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: Themes.SPACING.md,
  },
  modalCard: {
    width: "92%",
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.lg,
    padding: Themes.SPACING.lg,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginVertical: Themes.SPACING.sm,
    borderWidth: 1,
    borderColor: Themes.COLORS.soft,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Themes.SPACING.xs,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Themes.COLORS.primary,
    backgroundColor: Themes.COLORS.soft,
  },
  reviewerInfo: {
    marginLeft: Themes.SPACING.sm,
    flex: 1,
  },
  reviewerName: {
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    color: Themes.COLORS.textDark,
    marginBottom: Themes.SPACING.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  starIcon: {
    marginRight: 2,
  },
  ratingValue: {
    marginLeft: Themes.SPACING.xs,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.COLORS.textDark,
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  quoteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    paddingLeft: Themes.SPACING.sm,
    marginRight: Themes.SPACING.sm,
  },
  quoteIcon: {
    fontSize: 56,
    lineHeight: 56,
    color: Themes.COLORS.primary,
    opacity: 0.7,
    includeFontPadding: false,
    textAlignVertical: "center",
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    lineHeight: 20,
    marginTop: Themes.SPACING.sm,
  },
  expandText: {
    marginTop: 8,
    color: Themes.COLORS.primary,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontWeight: "600",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Themes.COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
  },
});
