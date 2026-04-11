import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import PetProfileCardViewMore from "../../PetProfileCard";
import * as Themes from "../../../assets/themes/themes";

export default function PCStep4Component({
  petData,
  onNext,
  onBack,
  onCreate,
  onFinish,
}) {
  const handleNext = async () => {
    await onCreate();
    onNext();
  };
  return (
    <View style={{ flex: 1 }}>
      <PetProfileCardViewMore
        pet={petData}
        isOwner={true}
        editingFooter={
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        }
      ></PetProfileCardViewMore>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 👈 Spaces them out
    marginTop: 30,
    paddingBottom: 20, // 👈 Ensures it's not hugging the bottom of the screen
  },
  backButton: {
    paddingVertical: Themes.SPACING.md,
    paddingHorizontal: 25,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: "#F5F5F5", // 👈 Give it a light background to look like a button
    marginRight: 10,
    elevation: 3,
  },
  nextButton: {
    flex: 1, // 👈 Takes up the remaining width
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    elevation: 3,
  },
  backButtonText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted, // A light gray
    fontSize: 16,
  },
  nextButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
  },
});
