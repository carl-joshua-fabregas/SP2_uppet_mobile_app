import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";
import { useNavigation } from "@react-navigation/native";
import { api } from "../api/axios";
import { useState } from "react";

export default function NotificationCard(props) {
  const { notification, onLongPress, markIsRead } = props;
  const navigation = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);

  // Validate notification object exists
  if (!notification || !notification._id) {
    console.warn("Invalid notification object:", notification);
    return null;
  }

  // Provide defaults for notification fields
  const type = notification?.notifType || "DEFAULT";
  const textContent =
    notification?.message || notification?.body || "New notification received";
  const dateStr = notification?.createdAt
    ? new Date(notification.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const isRead = notification?.isRead || false;

  const getTypeConfig = (type) => {
    switch (type) {
      // 🐾 Pet-themed icon updates using standard Ionicons
      case "RATING_RECEIVED":
      case "RATING_UPDATED":
        return { icon: "ribbon", color: "#FFB300", bg: "#FFF8E1" }; // amber ribbon
      case "RATING_DELETED":
        return { icon: "ribbon-outline", color: "#9E9E9E", bg: "#F5F5F5" };
      case "PET_LIVE":
      case "PET_UPDATED":
        return {
          icon: "paw",
          color: Themes.COLORS.primaryDark,
          bg: Themes.COLORS.soft,
        }; // mint green paw
      case "PET_DELETED":
        return { icon: "paw-outline", color: "#F44336", bg: "#FFEBEE" };
      case "ADOP_APP_RECEIVED":
        return { icon: "heart", color: "#E91E63", bg: "#FCE4EC" }; // pink heart (love for the pet)
      case "ADOP_APP_CANCELLED":
      case "ADOP_APP_DELETED":
        return { icon: "alert-circle", color: "#FF9800", bg: "#FFF3E0" };
      case "ADOP_APP_APPROVED":
        return { icon: "home", color: "#4CAF50", bg: "#E8F5E9" }; // green home (found a forever home!)
      case "ADOP_APP_REJECTED":
        return { icon: "sad-outline", color: "#F44336", bg: "#FFEBEE" }; // sad face for rejection
      case "ADOPTER_NEW":
      case "ADOPTER_UPDATED":
        return { icon: "people", color: "#9C27B0", bg: "#F3E5F5" }; // purple people (new family)
      default:
        // Fallback for old version
        if (type === "Approved")
          return {
            icon: "home",
            color: "#4CAF50",
            bg: "#E8F5E9",
          };
        if (type === "Cancelled")
          return {
            icon: "alert-circle-sharp",
            color: "#FF9800",
            bg: "#FFF3E0",
          };
        if (type === "Rejected")
          return {
            icon: "sad-outline",
            color: "#F44336",
            bg: "#FFEBEE",
          };
        if (type === "Pending")
          return {
            icon: "ellipsis-horizontal-circle-sharp",
            color: "#2196F3",
            bg: "#E3F2FD",
          };

        return {
          icon: "notifications",
          color: Themes.COLORS.textMuted,
          bg: "#F5F5F5",
        };
    }
  };

  const handlePress = async () => {
    // Only call the API if it's currently unread
    if (!isRead) {
      markIsRead(notification._id);
    }

    // Skip navigation if no related entity or if already navigating
    if (!notification?.relatedEntity || isNavigating) {
      console.log("No related entity or already navigating:", {
        relatedEntity: notification?.relatedEntity,
        isNavigating,
      });
      return;
    }

    setIsNavigating(true);

    try {
      const entityId = notification.relatedEntity;
      const entityModel = notification?.entityModel;

      console.log("Navigation triggered for notification type:", type, {
        entityId,
        entityModel,
      });

      // Handle different notification types with proper navigation
      if (type.startsWith("RATING_")) {
        // Ratings don't have a dedicated view, log and return
        console.log("Rating notification - no dedicated view", type);
        return;
      }

      if (type.startsWith("ADOPTER_")) {
        // Navigate to the adopter's profile
        try {
          navigation.navigate("viewAdopterProfile", {
            adopterId: entityId,
          });
        } catch (navErr) {
          console.error("Navigation error - trying viewProfile:", navErr);
          navigation.navigate("viewProfile");
        }
        return;
      }

      if (type.startsWith("PET_")) {
        // Don't navigate if pet was deleted
        if (type === "PET_DELETED") {
          console.log("Pet was deleted - skipping navigation");
          return;
        }

        try {
          const res = await api.get(`/api/pet/${entityId}`);
          if (res.data?.body) {
            navigation.navigate("viewPetProfile", { pet: res.data.body });
          } else {
            console.warn("Pet data not found in response");
          }
        } catch (err) {
          console.error("Error fetching pet data:", err.message);
          // Show error feedback to user
        }
        return;
      }

      if (type.startsWith("ADOP_APP_")) {
        try {
          const res = await api.get(`/api/adoptionApp/${entityId}`);
          const appData = res.data?.body;

          if (appData?.petToAdopt) {
            navigation.navigate("viewApplicantsMyAdoptees", {
              petID: appData.petToAdopt,
            });
          } else if (appData) {
            // Fallback: navigate to my applications view
            navigation.navigate("viewMyApplication");
          } else {
            console.warn("Adoption application data not found");
          }
        } catch (err) {
          console.error("Error fetching adoption app data:", err.message);
          // Fallback to my applications view
          try {
            navigation.navigate("viewMyApplication");
          } catch (fallbackErr) {
            console.error("Fallback navigation failed:", fallbackErr);
          }
        }
        return;
      }

      console.warn("Unhandled notification type:", type);
    } catch (err) {
      console.error("Unexpected error in handlePress:", err);
    } finally {
      setIsNavigating(false);
    }
  };

  const config = getTypeConfig(type);

  return (
    <TouchableOpacity
      style={[styles.notificationContainer, !isRead && styles.unreadContainer]}
      onPress={handlePress}
      onLongPress={() => {
        if (onLongPress && typeof onLongPress === "function") {
          onLongPress(notification._id);
        }
      }}
      delayLongPress={300}
      disabled={isNavigating}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={24} color={config.color} />
      </View>
      <View style={styles.textContainer}>
        <Text
          style={[styles.bodyText, !isRead && styles.unreadText]}
          numberOfLines={2}
        >
          {textContent}
        </Text>
        {dateStr ? <Text style={styles.dateText}>{dateStr}</Text> : null}
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Themes.SPACING.md,
    backgroundColor: Themes.COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: Themes.COLORS.soft,
  },
  unreadContainer: {
    backgroundColor: "#F0F9F5",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Themes.SPACING.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  bodyText: {
    ...Themes.TYPOGRAPHY.body,
    lineHeight: 20,
  },
  unreadText: {
    fontFamily: "Fredoka-SemiBold", // Assuming this exists in your fonts
    color: Themes.COLORS.textDark,
  },
  dateText: {
    ...Themes.TYPOGRAPHY.label,
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Themes.COLORS.primaryDark,
    marginLeft: Themes.SPACING.sm,
  },
});
