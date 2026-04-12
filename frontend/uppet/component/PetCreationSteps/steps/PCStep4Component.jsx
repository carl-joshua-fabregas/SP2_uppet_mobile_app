import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import PetProfileCardViewMore from "../../PetProfileCard";
import * as Themes from "../../../assets/themes/themes";

export default function PCStep4Component({
  petData,
  onNext,
  onBack,
  onCreate,
  uploading,
}) {
  const handleNext = async () => {
    try {
      const success = await onCreate();
      if (success) {
        onNext();
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Modal transparent={true} visible={uploading} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator
              size="large"
              color={Themes.COLORS.primary}
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.loadingText}>Creating Pet Profile...</Text>
            <Text style={styles.subLoadingText}>Uploading photos to cloud</Text>
          </View>
        </View>
      </Modal>
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
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // 👈 Dims the screen
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 18,
    color: Themes.COLORS.primary,
  },
  subLoadingText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textMuted,
    marginTop: 5,
  },
});
