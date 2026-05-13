import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Themes from "../../assets/themes/themes";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";

export default function APCProgressTracker({
  currentStep,
  STEPS,
  onChangeAccount,
  newUser,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.trackerRow}>
        {STEPS.map((steps, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <View key={index} style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}
              >
                {isCompleted ? (
                  <Ionicons
                    name={"checkmark-sharp"}
                    color={Themes.COLORS.badge}
                    size={20}
                  ></Ionicons>
                ) : (
                  <Text
                    style={[styles.stepNum, isActive && styles.stepNumActive]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[styles.line, isCompleted && styles.lineCompleted]}
                />
              )}
            </View>
          );
        })}
      </View>

      {newUser && (
        <TouchableOpacity
          onPress={onChangeAccount}
          style={styles.changeAccountRow}
        >
          <Text style={styles.changeAccountText}>
            Not you?{" "}
            <Text style={styles.changeAccountLink}>Change account</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Themes.COLORS.background,
    alignItems: "center",
  },
  trackerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  circleCompleted: {
    backgroundColor: Themes.COLORS.primary,
  },
  circleActive: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: Themes.COLORS.primary,
  },
  stepNum: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 12,
    color: "#888",
  },
  stepNumActive: {
    color: Themes.COLORS.primary,
    fontWeight: "bold",
  },
  line: {
    width: 40,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: -2,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: Themes.COLORS.primary,
  },
  changeAccountRow: {
    paddingBottom: 12,
  },
  changeAccountText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    color: "#888",
  },
  changeAccountLink: {
    color: Themes.COLORS.primary,
    fontWeight: "600",
  },
});
