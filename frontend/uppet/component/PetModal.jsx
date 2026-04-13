import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { useNavigation } from "@react-navigation/native";

export default function PetModal({ pet, onClose }) {
  const navigator = useNavigation();
  const petProfilePhoto = pet?.photos?.find((photo) => photo.isProfile === 1);
  return (
    <Modal
      visible={!!pet}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={
                petProfilePhoto
                  ? { uri: petProfilePhoto.url }
                  : require("../assets/images/doggoe.jpg")
              }
              style={styles.imageStyle}
            />

            <View style={styles.petDetailsContainer}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>
                {pet.breed} • {pet.sex}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{pet.age} years old</Text>
                </View>
              </View>
              <Text style={styles.petBio}>{pet.bio}</Text>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>x</Text>
          </TouchableOpacity>
          <View style={styles.meetButtonContainer}>
            <TouchableOpacity
              style={styles.meetButton}
              onPress={() => {
                onClose();
                navigator.navigate("viewPetProfile", { pet: pet });
              }}
            >
              <Text style={styles.meetButtonText}>Meet {pet.name}!</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    height: "80%",
    backgroundColor: Themes.COLORS.card,
    borderTopLeftRadius: Themes.RADIUS.lg,
    borderTopRightRadius: Themes.RADIUS.lg,
    overflow: "hidden",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Themes.COLORS.textDark + "40",
    justifyContent: "flex-end",
    padding: Themes.SPACING.md,
  },
  imageStyle: {
    resizeMode: "cover",
    width: "100%",
    height: 220,
  },
  petDetailsContainer: {
    padding: Themes.SPACING.md,
  },
  petName: {
    fontSize: Themes.TYPOGRAPHY.heading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.TYPOGRAPHY.heading.color,
    marginBottom: Themes.SPACING.xs,
  },
  petBio: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.TYPOGRAPHY.body.color,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: Themes.SPACING.sm,
    marginTop: Themes.SPACING.xs,
    gap: Themes.SPACING.sm,
    flexWrap: "wrap",
  },
  badgeText: {
    fontSize: Themes.TYPOGRAPHY.badgeText.fontSize,
    fontFamily: Themes.TYPOGRAPHY.badgeText.fontFamily,
    color: Themes.TYPOGRAPHY.badgeText.color,
  },
  badgeContainer: {
    backgroundColor: Themes.COLORS.badge,
    borderColor: Themes.COLORS.soft,
    borderWidth: 1,
    borderRadius: Themes.RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  petBreed: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.TYPOGRAPHY.subsubheading.color,
  },
  closeButton: {
    position: "absolute",
    top: Themes.SPACING.md,
    right: Themes.SPACING.md,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    width: 32,
    height: 32,
    borderRadius: Themes.RADIUS.pill,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 22,
    color: Themes.COLORS.textLight,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    lineHeight: 22, // Center the "x" vertically
    transform: [{ translateY: -3 }], // Adjust vertical position if needed
  },
  meetButtonContainer: {
    padding: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.lg,
    borderTopWidth: 1,
    borderColor: Themes.COLORS.soft,
    backgroundColor: Themes.COLORS.card,
  },
  meetButton: {
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
  },
  meetButtonText: {
    color: "#fff",

    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
  },
});

// backgroundColor: "rgba(29, 59, 46, 0.7)",
