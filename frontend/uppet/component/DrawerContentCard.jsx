import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import * as Themes from "../assets/themes/themes.js";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileDrawer(props) {
  const { user, logout } = useUser();
  const router = useNavigation();

  const handleProfileClick = () => {
    router.navigate("viewProfile");
  };

  const handleSignOut = async () => {
    try {
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Upper Section: Split Background & Profile */}
      <View style={styles.headerContainer}>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.upperBackground} />
          <View style={styles.lowerBackground} />
        </View>

        {/* Foreground Profile Content - Completely clean with just the chevron */}
        <Pressable
          style={({ pressed }) => [
            styles.profileContent,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleProfileClick}
        >
          <Image
            source={{ uri: user?.profilePhoto?.url }}
            style={styles.profileImage}
          />
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {user?.firstName} {user?.middleName ? user.middleName + " " : ""}
              {user?.lastName}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Themes.COLORS.textDark}
            />
          </View>
        </Pressable>
      </View>

      {/* Lower Section: Menus */}
      <View style={styles.menuContainer}>
        {/* Top Menu Items (Just My Adoptees) */}
        <View style={styles.topMenuItems}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => router.navigate("viewMyApplication")}
          >
            <Ionicons
              name="paw-outline"
              size={24}
              color={Themes.COLORS.primaryDark}
            />
            <Text style={styles.menuItemText}>My Applications</Text>
          </Pressable>
        </View>

        {/* Bottom Menu Items (Pinned to the bottom via space-between) */}
        <View style={styles.bottomMenuItems}>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              pressed && styles.menuItemPressed,
            ]}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={Themes.COLORS.primaryDark}
            />
            <Text style={styles.menuItemText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.card,
  },
  headerContainer: {
    height: 240,
    justifyContent: "center",
  },
  upperBackground: {
    flex: 1,
    backgroundColor: Themes.COLORS.primary,
  },
  lowerBackground: {
    flex: 1,
    backgroundColor: Themes.COLORS.card,
  },
  profileContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Themes.SPACING.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Themes.COLORS.card,
    marginBottom: Themes.SPACING.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    color: Themes.COLORS.textDark,
    textAlign: "center",
    marginRight: 4,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Themes.SPACING.md,
    paddingTop: Themes.SPACING.lg,
    justifyContent: "space-between", // Keeps Sign Out at the bottom
  },
  topMenuItems: {},
  bottomMenuItems: {
    paddingBottom: Themes.SPACING.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Themes.COLORS.card,
    paddingVertical: Themes.SPACING.md,
    paddingHorizontal: Themes.SPACING.lg,
    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuItemPressed: {
    backgroundColor: Themes.COLORS.soft,
  },
  menuItemText: {
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.textDark,
    marginLeft: Themes.SPACING.md,
  },
});
