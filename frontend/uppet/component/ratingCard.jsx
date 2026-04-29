import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

export default function RatingCard({ review, onPress }) {
  const reviewer = review?.reviewer || {};
  const name = reviewer.firstName
    ? `${reviewer.firstName}${reviewer.lastName ? ` ${reviewer.lastName}` : ""}`
    : "Anonymous";
  const score = typeof review.score === "number" ? review.score : 0;
  const avatarSource = reviewer.profilePhoto?.url
    ? { uri: reviewer.profilePhoto.url }
    : require("../assets/images/doggoe.jpg");

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      android_ripple={{ color: "#0002" }}
    >
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
        <View style={styles.quoteContainer}>
          <Text style={styles.quoteIcon}>”</Text>
        </View>
      </View>

      <Text style={styles.bodyText} numberOfLines={3}>
        {review.body || "No review details available."}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  quoteContainer: {
    justifyContent: "center", // Perfectly centers the quote relative to the reviewerRow's height
    alignItems: "flex-end",
    paddingLeft: Themes.SPACING.sm,
  },
  quoteIcon: {
    fontSize: 56, // Scaled down to gracefully match a ~48px avatar block
    lineHeight: 56, // Matched to font size so the text bounding box doesn't warp the layout
    color: Themes.COLORS.primary,
    opacity: 0.7,
    includeFontPadding: false, // Crucial for precise vertical centering on Android
    textAlignVertical: "center",
    fontWeight: "bold",
  },
  bodyText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    lineHeight: 20,
  },
});
