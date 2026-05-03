import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Themes from "../../../assets/themes/themes";

export default function PCStep5Component({ petData, onFinish }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Celebration Icon */}
        <View style={styles.iconCircle}>
          <MaterialIcons name="check" size={60} color="#FFF" />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Yey! All Done!</Text>
        <Text style={styles.subTitle}>
          {petData.name}'s profile has been created successfully. Adopters can
          now see your furry friend!
        </Text>
      </View>

      {/* Final Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => onFinish(petData)}
          style={styles.finishButton}
        >
          <Text style={styles.finishButtonText}>View My Adoptees</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
    justifyContent: "center",
    padding: Themes.SPACING.xl,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Themes.COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 5,
    shadowColor: Themes.COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 28,
    color: Themes.COLORS.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  subTitle: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.textMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 40,
  },
  finishButton: {
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: 18,
    borderRadius: Themes.RADIUS.lg,
    alignItems: "center",
    elevation: 3,
  },
  finishButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 18,
  },
});
