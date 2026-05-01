import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

export default function PetProfileCardViewMore({
  pet,
  isGalleryExpanded,
  setIsGalleryExpanded,
  handleGalleryLayout,
}) {
  const profilePhoto =
    pet.photos && pet.photos.length > 0
      ? pet.photos.find((photo) => photo.isProfile)
      : null;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const form = {
    name: pet.name,
    age: pet.age,
    bio: pet.bio,
    sex: pet.sex,
    species: pet.species,
    breed: pet.breed,
    size: pet.size,
    weight: pet.weight,
    vaccination: pet.vaccination,
    sn: pet.sn,
    healthCond: pet.healthCond,
    behavior: pet.behavior,
    specialNeeds: pet.specialNeeds,
    otherInfo: pet.otherInfo,
    photos: pet.photos,
  };

  // Helper component for section headers
  const SectionHeader = ({ icon, title, style }) => (
    <View style={[styles.sectionHeaderRow, style]}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={Themes.COLORS.primary}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Helper component for info labels inside cards
  const InfoLabel = ({ icon, title, style }) => (
    <View style={[styles.infoLabelRow, style]}>
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={Themes.COLORS.textMuted}
      />
      <Text style={styles.infoLabel}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.profileContainer}>
      {/* 1. THE HEADER CARD */}
      <View style={styles.headerCard}>
        <Image
          source={
            profilePhoto
              ? { uri: profilePhoto.url }
              : require("../assets/images/doggoe.jpg")
          }
          style={styles.headerImage}
        />

        <View style={styles.headerTextContainer}>
          <Text style={styles.petName}>{form.name}</Text>
          <Text style={styles.petBreed}>
            {form.species} • {form.breed} • {form.sex}
          </Text>

          {/* Stats Grid */}
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
              <Text style={styles.statValue}>{form.age} yrs</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.iconLabelRow}>
                <MaterialCommunityIcons
                  name="ruler"
                  size={14}
                  color={Themes.COLORS.textMuted}
                />
                <Text style={styles.statLabel}>Size</Text>
              </View>
              <Text style={styles.statValue}>{form.size}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.iconLabelRow}>
                <MaterialCommunityIcons
                  name="weight-kilogram"
                  size={14}
                  color={Themes.COLORS.textMuted}
                />
                <Text style={styles.statLabel}>Weight</Text>
              </View>
              <Text style={styles.statValue}>{form.weight}kg</Text>
            </View>
          </View>

          <SectionHeader
            icon="card-text-outline"
            title="Bio"
            style={{ marginLeft: 0, marginTop: 4 }}
          />
          <Text
            style={[
              styles.petBio,
              {
                borderBottomWidth: 1,
                paddingBottom: 12,
                borderBottomColor: "#F0F0F0",
              },
            ]}
          >
            {form.bio}
          </Text>
        </View>
      </View>

      <View style={styles.contentPadding}>
        {/* 2. HEALTH & BEHAVIOR CARD */}
        <SectionHeader icon="heart-pulse" title="Health and Behavior" />
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <InfoLabel icon="needle" title="Vaccination Status" />
            <Text style={styles.infoValue}>{form.vaccination}</Text>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="content-cut" title="Spayed/Neutered" />
            <Text style={styles.infoValue}>{form.sn ? "Yes" : "No"}</Text>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="medical-bag" title="Health Condition" />
            <Text style={styles.infoValue}>{form.healthCond || "None"}</Text>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="dog" title="Behavior" />
            <Text style={styles.infoValue}>{form.behavior}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <InfoLabel icon="alert-circle-outline" title="Special Needs" />
            <Text style={styles.infoValue}>{form.specialNeeds || "None"}</Text>
          </View>
        </View>

        {/* 3. ADDITIONAL INFO CARD */}
        {pet.otherInfo && (
          <>
            <SectionHeader
              icon="information-outline"
              title="Additional Information"
            />
            <View style={styles.card}>
              <View
                style={[
                  styles.infoRow,
                  {
                    flexDirection: "column",
                    alignItems: "flex-start",
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <InfoLabel
                  icon="text-box-outline"
                  title="Other Details"
                  style={{ marginBottom: 8 }}
                />
                <Text style={styles.petBio}>{form.otherInfo}</Text>
              </View>
            </View>
          </>
        )}

        {/* 4. GALLERY SECTION (NOW WRAPPED IN A CARD) */}
        {form.photos && form.photos.length > 0 && (
          <View style={styles.gallerySection}>
            <SectionHeader
              icon="image-multiple-outline"
              title="Photo Gallery"
              style={{ marginTop: 0 }}
            />

            {/* Main Gallery Card Wrapper */}
            <View
              style={[
                styles.card,
                {
                  paddingHorizontal: 0,
                  paddingBottom: isGalleryExpanded ? 0 : Themes.SPACING.md,
                },
              ]}
            >
              {/* Header inside the card */}
              <View style={styles.galleryHeader}>
                <Text style={styles.infoLabel}>
                  {form.photos.length} Photos
                </Text>
                <TouchableOpacity
                  onPress={() => setIsGalleryExpanded((prev) => !prev)}
                >
                  <Text style={styles.galleryToggleButton}>
                    {isGalleryExpanded ? "Close Gallery" : "View All..."}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isGalleryExpanded ? (
                // --- COLLAPSED CAROUSEL ---
                <View
                  style={[
                    styles.carouselContainer,
                    { marginHorizontal: Themes.SPACING.md },
                  ]}
                  key={`carousel- ${isGalleryExpanded}`}
                >
                  <Image
                    source={{ uri: form.photos[currentPhotoIndex]?.url }}
                    style={styles.carouselImage}
                  />
                  {form.photos.length > 1 && (
                    <View
                      style={StyleSheet.absoluteFill}
                      pointerEvents="box-none"
                    >
                      <TouchableOpacity
                        style={styles.carouselPrevButton}
                        onPress={() =>
                          setCurrentPhotoIndex((prev) =>
                            prev === 0 ? form.photos.length - 1 : prev - 1,
                          )
                        }
                      >
                        <Text style={styles.carouselArrow}>‹</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.carouselNextButton}
                        onPress={() =>
                          setCurrentPhotoIndex((prev) =>
                            prev === form.photos.length - 1 ? 0 : prev + 1,
                          )
                        }
                      >
                        <Text style={styles.carouselArrow}>›</Text>
                      </TouchableOpacity>
                      <View style={styles.carouselDotsContainer}>
                        {form.photos.slice(0, 5).map((_, index) => {
                          const isActive =
                            form.photos.length <= 5
                              ? index === currentPhotoIndex
                              : currentPhotoIndex >= 4
                                ? index === 4
                                : index === currentPhotoIndex;
                          return (
                            <View
                              key={index}
                              style={[
                                styles.carouselDot,
                                isActive && styles.carouselDotActive,
                              ]}
                            />
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                // --- EXPANDED VERTICAL FEED ---
                <View
                  onLayout={(e) => handleGalleryLayout(e)}
                  style={styles.expandedGalleryContainer}
                  key={`gallery-${isGalleryExpanded}`}
                >
                  {form.photos.map((photo, index) => (
                    <View key={index} style={styles.photoFeedItem}>
                      <Image
                        source={{ uri: photo.url }}
                        style={styles.photoFeedImage}
                      />
                      <View style={styles.photoFeedContent}>
                        <View style={styles.photoCardTitleRow}>
                          <MaterialCommunityIcons
                            name="camera-outline"
                            size={16}
                            color={Themes.COLORS.primary}
                          />
                          <Text style={styles.photoCardTitle}>
                            About this photo
                          </Text>
                        </View>
                        <Text style={styles.photoCardCaption}>
                          {photo.caption ||
                            "Just being cute! No caption provided yet."}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: { flex: 1, backgroundColor: Themes.COLORS.background },
  headerCard: {
    backgroundColor: Themes.COLORS.card,
    borderBottomLeftRadius: Themes.RADIUS.lg,
    borderBottomRightRadius: Themes.RADIUS.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
    marginBottom: Themes.SPACING.sm,
  },
  headerImage: { width: "100%", height: 300, resizeMode: "cover" },
  headerTextContainer: { padding: Themes.SPACING.lg },
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
  petBio: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textDark,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Themes.SPACING.md,
    width: "100%",
  },
  statItem: {
    width: "30%",
    backgroundColor: Themes.COLORS.soft,
    padding: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.sm,
    alignItems: "center",
  },
  iconLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  contentPadding: {
    paddingHorizontal: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    marginLeft: Themes.SPACING.sm,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoLabel: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    fontSize: 14,
  },
  infoValue: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.textDark,
    fontSize: 14,
  },
  gallerySection: { marginTop: Themes.SPACING.sm },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Themes.SPACING.md,
    paddingTop: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.sm,
  },
  galleryToggleButton: {
    color: Themes.COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  carouselContainer: {
    marginTop: Themes.SPACING.xs,
    borderRadius: Themes.RADIUS.md,
    overflow: "hidden",
    height: 250,
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: Themes.COLORS.soft,
  },
  carouselPrevButton: {
    position: "absolute",
    left: Themes.SPACING.sm,
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselNextButton: {
    position: "absolute",
    right: Themes.SPACING.sm,
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  carouselArrow: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 26,
  },
  carouselDotsContainer: {
    position: "absolute",
    bottom: Themes.SPACING.sm,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  carouselDotActive: {
    backgroundColor: "#fff",
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -1,
  },

  // --- NEW EXPANDED FEED STYLES ---
  expandedGalleryContainer: {
    marginTop: Themes.SPACING.xs,
  },
  photoFeedItem: {
    // We remove the margin and border so there are no awkward lines or gaps
    marginBottom: 0,
  },
  photoFeedContent: {
    padding: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.lg, // Add extra padding here so the text doesn't touch the next image
    backgroundColor: Themes.COLORS.card,
  },
  photoFeedImage: {
    width: "100%",
    height: 320, // Tall, edge-to-edge Instagram style feed
    resizeMode: "cover",
  },
  photoCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  photoCardTitle: {
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: 14,
    color: Themes.COLORS.primary,
    fontWeight: "600",
  },
  photoCardCaption: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: Themes.COLORS.textDark,
    lineHeight: 20,
  },
});
