import { View, StyleSheet } from "react-native";

export default function PCProgressBar({ currentStep, totalSteps }) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { flex: progressPercentage }]} />
      <View style={{ flex: 1 - progressPercentage }} />
    </View>
  );
}

const styles = StyleSheet.create({
  pcrprogressBarContainer: {
    flex: 1,
    backgroundColor: "#FFF9F5",
  },
  progressTrack: {
    backgroundColor: "#FDF2E9",
    borderRadius: 9999,
    marginBottom: 20,
    height: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: "#efb07d",
    borderRadius: 9999,
  },
});
