import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

export default function ViewApplicantsCard({
  adoptionApp,
  handleAccept,
  handleReject,
}) {
  const navigator = useNavigation();
  const applicant = adoptionApp.applicant;

  const onViewApplicantPress = () => {
    navigator.navigate("viewAdopterProfile", { id: applicant._id });
  };

  const Badge = ({ status }) => {
    let badgeStyle, textStyle;
    switch (status) {
      case "Pending":
        badgeStyle = styles.badgePending;
        textStyle = styles.badgeTextPending;
        break;
      case "Approved":
        badgeStyle = styles.badgeApproved;
        textStyle = styles.badgeTextApproved;
        break;
      case "Rejected":
        badgeStyle = styles.badgeRejected;
        textStyle = styles.badgeTextRejected;
        break;
      default:
        badgeStyle = styles.badgePending;
        textStyle = styles.badgeTextPending;
    }
    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <Text style={[styles.statusText, textStyle]}>{status}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={onViewApplicantPress}
      activeOpacity={0.8}
    >
      {/* Applicant Thumbnail */}
      <Image
        source={
          applicant.profilePicture
            ? { uri: applicant.profilePicture }
            : require("../assets/images/doggoe.jpg")
        }
        style={styles.profileImage}
      />

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.applicantName} numberOfLines={1}>
            {applicant.firstName}{" "}
            {applicant.middleName ? applicant.middleName + " " : ""}
            {applicant.lastName}
          </Text>

          {/* Status Badge */}
          <Badge status={adoptionApp.status} />
        </View>

        <View style={styles.iconRow}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={14}
            color={Themes.COLORS.textFaded || "#6B7280"}
          />
          <Text style={styles.detailsText} numberOfLines={1}>
            {" "}
            {applicant.address}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.statsContainer}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={14}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.statsText}>
              {" "}
              Applied on:{" "}
              {adoptionApp.updatedAt
                ? new Date(adoptionApp.updatedAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          {/* The chevron arrow was intentionally removed here */}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.sm,
    padding: Themes.SPACING.md,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 2,
  },
  profileImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  infoContainer: {
    flex: 1,
    marginLeft: Themes.SPACING.md,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applicantName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    color: Themes.TYPOGRAPHY.heading.color,
    flex: 1,
    marginRight: Themes.SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: Themes.SPACING.sm,
    paddingVertical: Themes.SPACING.xs,
    borderRadius: Themes.SPACING.sm,
  },
  statusText: {
    fontSize: Themes.TYPOGRAPHY.badgeText.fontSize,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badgePending: {
    backgroundColor: "#FFF4E0",
  },
  badgeApproved: {
    backgroundColor: Themes.COLORS.badge || "#D1FAE5",
  },
  badgeRejected: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextPending: {
    color: "#D97706",
  },
  badgeTextApproved: {
    color: Themes.COLORS.badgeText || "#065F46",
  },
  badgeTextRejected: {
    color: "#991B1B",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
  },
  detailsText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textFaded || "#6B7280",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: Themes.SPACING.sm,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.TYPOGRAPHY.label.color,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
});
