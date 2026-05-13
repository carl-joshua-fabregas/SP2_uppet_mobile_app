import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { useUser } from "../context/UserContext";
import * as Themes from "../assets/themes/themes";
import { AntDesign } from "@expo/vector-icons";

export default function Login() {
  const { handleSignIn } = useUser();

  return (
    <View style={styles.fullScreenContainer}>
      {/* Logo circle */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/SplashScreen-white.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* App name */}
      <Text style={styles.appName}>UPPET</Text>

      {/* Tagline */}
      <Text style={styles.slogan}>
        Helping companion animals find their forever home
      </Text>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleSignIn}
        activeOpacity={0.8}
      >
        <AntDesign
          name="google"
          size={20}
          color="#FFFFFF"
          style={styles.googleIcon}
        />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Terms */}
      <Text style={styles.terms}>
        By signing in, you agree to our Terms &amp; Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.primary, // #A8E6CF mint green
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Themes.SPACING.lg,
  },

  // Frosted circle frame around the logo
  logoWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Themes.SPACING.lg,
  },

  logo: {
    width: 120,
    height: 120,
    aspectRatio: 3 / 2,
  },

  // App name in dark forest green
  appName: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 32,
    color: Themes.COLORS.textDark,
    letterSpacing: -0.5,
    marginBottom: Themes.SPACING.xs,
  },

  slogan: {
    fontFamily: "Fredoka-Regular",
    fontSize: 16,
    textAlign: "center",
    color: Themes.COLORS.textDark,
    opacity: 0.7,
    marginBottom: Themes.SPACING.xxl,
    paddingHorizontal: Themes.SPACING.lg,
    lineHeight: 22,
  },

  // Dark pill button — matches background palette, white text
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Themes.COLORS.textDark, // #1D3B2E dark forest green
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: Themes.RADIUS.pill,
    paddingVertical: 15,
    paddingHorizontal: Themes.SPACING.xl,
    width: "85%",
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  googleIcon: {
    marginRight: Themes.SPACING.sm,
  },

  buttonText: {
    fontFamily: "Fredoka-Medium",
    fontSize: 17,
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  terms: {
    fontFamily: "Fredoka-Regular",
    fontSize: 12,
    color: Themes.COLORS.textDark,
    opacity: 0.45,
    textAlign: "center",
    marginTop: Themes.SPACING.lg,
    paddingHorizontal: Themes.SPACING.xl,
  },
});
