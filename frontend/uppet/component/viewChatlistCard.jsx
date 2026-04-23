import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
// Import your themes here
// import { Themes.COLORS, Themes.SPACING, Themes.RADIUS, Themes.TYPOGRAPHY } from "../theme";
import * as Themes from "../assets/themes/themes";

export default function ChatListCard({
  name,
  lastMessage,
  time,
  unreadCount,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      {/* Avatar Placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>

      {/* Message Info */}
      <View style={styles.messageContent}>
        <View style={styles.headerRow}>
          <Text style={Themes.TYPOGRAPHY.subheading} numberOfLines={1}>
            {name}
          </Text>
          <Text style={Themes.TYPOGRAPHY.label}>{time}</Text>
        </View>
        <Text
          style={[
            Themes.TYPOGRAPHY.body,
            {
              color: unreadCount
                ? Themes.COLORS.textDark
                : Themes.COLORS.textMuted,
            },
          ]}
          numberOfLines={1}
        >
          {lastMessage}
        </Text>
      </View>

      {/* Unread Badge (Optional) */}
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={Themes.TYPOGRAPHY.badgeText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Themes.COLORS.card,
    padding: Themes.SPACING.md,
    marginHorizontal: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    // Optional: Add a subtle shadow here
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: Themes.RADIUS.pill,
    backgroundColor: Themes.COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Themes.SPACING.md,
  },
  avatarText: {
    ...Themes.TYPOGRAPHY.subheading,
    color: Themes.COLORS.primaryDark,
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Themes.SPACING.xs,
  },
  badge: {
    backgroundColor: Themes.COLORS.badge,
    paddingHorizontal: Themes.SPACING.sm,
    paddingVertical: Themes.SPACING.xs,
    borderRadius: Themes.RADIUS.pill,
    marginLeft: Themes.SPACING.sm,
  },
});
