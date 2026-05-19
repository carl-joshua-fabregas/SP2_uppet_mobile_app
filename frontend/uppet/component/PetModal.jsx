import { useState } from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

// --- ADDED: Reusable Toggle Component ---
const ExpandableText = ({
  text,
  style,
  maxLength = 120,
  fallback = "None",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <Text style={style}>{fallback}</Text>;

  const shouldTruncate = text.length > maxLength;
  const displayText =
    isExpanded || !shouldTruncate
      ? text
      : `${text.substring(0, maxLength).trim()}...`;

  return (
    <View style={{ flexShrink: 1, width: "100%" }}>
      <Text style={style}>{displayText}</Text>
      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{ marginTop: 4 }}
        >
          <Text
            style={{
              color: Themes.COLORS.primary,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {isExpanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function PetModal({ pet, onClose }) {
  const { user } = useUser();
  const navigator = useNavigation();
  const isOwner = user._id === pet.ownerId._id;

  const petProfilePhoto = pet?.photos?.find((photo) => photo.isProfile);

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
              {/* CHANGED: Safeguarded headers from extreme input lengths */}
              <Text style={styles.petName} numberOfLines={2}>
                {pet.name}
              </Text>
              <Text style={styles.petBreed} numberOfLines={2}>
                {pet.species ? `${pet.species} • ` : ""}
                {pet.breed} • {pet.sex}
              </Text>

              {/* Stats Grid matching PetProfileCard */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.iconLabelRow}>
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={14}
                      color={Themes.COLORS.textMuted}
                    />
                    <Text style={styles.statLabel}>Age</Text>
                  </View>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {pet.age ? parseFloat(pet.age).toFixed(1) : "0.0"} yrs
                  </Text>
                </View>

                {pet.size ? (
                  <View style={styles.statItem}>
                    <View style={styles.iconLabelRow}>
                      <MaterialCommunityIcons
                        name="ruler"
                        size={14}
                        color={Themes.COLORS.textMuted}
                      />
                      <Text style={styles.statLabel}>Size</Text>
                    </View>
                    <Text style={styles.statValue} numberOfLines={1}>
                      {pet.size}
                    </Text>
                  </View>
                ) : null}

                {pet.weight ? (
                  <View style={styles.statItem}>
                    <View style={styles.iconLabelRow}>
                      <MaterialCommunityIcons
                        name="weight-kilogram"
                        size={14}
                        color={Themes.COLORS.textMuted}
                      />
                      <Text style={styles.statLabel}>Weight</Text>
                    </View>
                    <Text style={styles.statValue} numberOfLines={1}>
                      {pet.weight ? parseFloat(pet.weight).toFixed(2) : "0.00"}
                      kg
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Section Header matching PetProfileCard */}
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons
                  name="card-text-outline"
                  size={18}
                  color={Themes.COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Bio</Text>
              </View>
              {/* CHANGED: Applied ExpandableText component */}
              <ExpandableText
                text={pet.bio}
                style={styles.petBio}
                maxLength={150}
                fallback="No bio provided."
              />
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
              <Text style={styles.meetButtonText}>
                {isOwner ? `Review Adoptee Profile` : `Meet ${pet.name}!`}
              </Text>
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
    aspectRatio: 4 / 3,
  },
  petDetailsContainer: {
    padding: Themes.SPACING.lg,
  },
  petName: {
    fontSize: 32,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.TYPOGRAPHY.heading.color,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Themes.SPACING.lg,
    width: "100%",
  },
  statItem: {
    width: "31%",
    backgroundColor: Themes.COLORS.soft,
    padding: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.sm,
    alignItems: "center",
  },
  iconLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    color: Themes.COLORS.textMuted,
  },
  statValue: {
    fontSize: 14,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.textDark,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Themes.SPACING.sm,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  petBio: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textDark,
    lineHeight: 22,
  },
  closeButton: {
    position: "absolute",
    top: Themes.SPACING.md,
    right: Themes.SPACING.md,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    lineHeight: 22,
    transform: [{ translateY: -3 }],
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
