import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";
import { useNavigation } from "@react-navigation/native";
import { api } from "../api/axios";

export default function NotificationCard(props) {
  const { notification } = props;
  const navigation = useNavigation();

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
      case "RATING_RECEIVED":
      case "RATING_UPDATED":
        return { icon: "star", color: "#FFB300", bg: "#FFF8E1" }; // amber
      case "RATING_DELETED":
        return { icon: "star-outline", color: "#9E9E9E", bg: "#F5F5F5" }; // grey
      case "PET_LIVE":
      case "PET_UPDATED":
        return {
          icon: "paw",
          color: Themes.COLORS.primaryDark,
          bg: Themes.COLORS.soft,
        }; // mint green
      case "PET_DELETED":
        return { icon: "paw-outline", color: "#F44336", bg: "#FFEBEE" }; // red
      case "ADOP_APP_RECEIVED":
        return { icon: "document-text", color: "#2196F3", bg: "#E3F2FD" }; // blue
      case "ADOP_APP_CANCELLED":
      case "ADOP_APP_DELETED":
        return { icon: "alert-circle", color: "#FF9800", bg: "#FFF3E0" }; // orange
      case "ADOP_APP_APPROVED":
        return { icon: "checkmark-circle", color: "#4CAF50", bg: "#E8F5E9" }; // green
      case "ADOP_APP_REJECTED":
        return { icon: "close-circle", color: "#F44336", bg: "#FFEBEE" }; // red
      case "ADOPTER_NEW":
      case "ADOPTER_UPDATED":
        return { icon: "person", color: "#9C27B0", bg: "#F3E5F5" }; // purple
      default:
        // Fallback for old version
        if (type === "Approved")
          return {
            icon: "checkmark-circle-sharp",
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
            icon: "close-circle-sharp",
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
    if (!notification?.relatedEntity) return;

    try {
      if (type.startsWith("ADOPTER_")) {
        navigation.navigate("viewProfile");
      } else if (type.startsWith("PET_") && type !== "PET_DELETED") {
        const res = await api.get(`/api/pet/${notification.relatedEntity}`);
        if (res.data?.body) {
          navigation.navigate("viewPetProfile", { pet: res.data.body });
        }
      } else if (type.startsWith("ADOP_APP_")) {
        const res = await api.get(
          `/api/adoptionApp/${notification.relatedEntity}`,
        );
        const appData = res.data?.body;
        if (appData?.petToAdopt) {
          navigation.navigate("viewApplicantsMyAdoptees", {
            petID: appData.petToAdopt,
          });
        }
      }
    } catch (err) {
      console.error("Navigation error from notification:", err);
    }
  };

  const config = getTypeConfig(type);

  return (
    <TouchableOpacity
      style={[styles.notificationContainer, !isRead && styles.unreadContainer]}
      onPress={handlePress}
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
    fontFamily: "Fredoka-SemiBold",
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
