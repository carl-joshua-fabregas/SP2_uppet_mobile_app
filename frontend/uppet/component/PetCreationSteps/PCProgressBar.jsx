import { View, StyleSheet } from "react-native";
import * as Themes from "../../assets/themes/themes";

export default function PCProgressBar({ currentStep, totalSteps }) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  console.log(currentStep, totalSteps);
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${progressPercentage}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 10,
    width: "90%", // Leave some room on the sides
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "center", // Center the bar
    marginTop: 20, // Don't hug the top of the screen
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Themes.COLORS.primary,
  },
});
