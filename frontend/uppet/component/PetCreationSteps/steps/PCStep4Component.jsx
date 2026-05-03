import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import PetProfileCardViewMore from "../../PetProfileCard";
import * as Themes from "../../../assets/themes/themes";

export default function PCStep4Component({ petData, uploading }) {
  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={uploading} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator
              size="large"
              color={Themes.COLORS.primary}
              style={{ marginBottom: 15 }}
            />
            <Text style={styles.loadingText}>Saving Pet Profile...</Text>
            <Text style={styles.subLoadingText}>Uploading data to cloud</Text>
          </View>
        </View>
      </Modal>

      <PetProfileCardViewMore pet={petData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  footerContainer: {
    paddingHorizontal: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.xl,
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
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
