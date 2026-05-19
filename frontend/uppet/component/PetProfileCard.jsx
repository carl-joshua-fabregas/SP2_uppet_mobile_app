import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

// --- ADDED: Reusable Toggle Component with Alignment ---
const ExpandableText = ({
  text,
  style,
  maxLength = 80,
  align = "left",
  fallback = "None",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text)
    return <Text style={[style, { textAlign: align }]}>{fallback}</Text>;

  const shouldTruncate = text.length > maxLength;
  const displayText =
    isExpanded || !shouldTruncate
      ? text
      : `${text.substring(0, maxLength).trim()}...`;

  return (
    <View
      style={{
        flexShrink: 1,
        width: "100%",
        alignItems: align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <Text style={[style, { textAlign: align }]}>{displayText}</Text>
      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={{ marginTop: 2 }}
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

export default function PetProfileCardViewMore({
  pet,
  isGalleryExpanded,
  setIsGalleryExpanded,
  handleGalleryLayout,
  handlePressImage,
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => {
            if (profilePhoto?.url) handlePressImage(profilePhoto, 0);
          }}
        >
          <Image
            source={
              profilePhoto
                ? { uri: profilePhoto.url }
                : require("../assets/images/doggoe.jpg")
            }
            style={styles.headerImage}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.petName} numberOfLines={2}>
            {form.name}
          </Text>
          <Text style={styles.petBreed} numberOfLines={2}>
            {form.species} • {form.breed} • {form.sex}
          </Text>

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
                {form.age ? parseFloat(form.age).toFixed(1) : "0.0"} yrs
              </Text>
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
              <Text style={styles.statValue} numberOfLines={1}>
                {form.size}
              </Text>
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
              <Text style={styles.statValue} numberOfLines={1}>
                {form.weight ? parseFloat(form.weight).toFixed(2) : "0.00"}kg
              </Text>
            </View>
          </View>

          <SectionHeader
            icon="card-text-outline"
            title="Bio"
            style={{ marginLeft: 0, marginTop: 4 }}
          />
          {/* CHANGED: Wrapped bio in ExpandableText */}
          <View
            style={{
              borderBottomWidth: 1,
              paddingBottom: 12,
              borderBottomColor: "#F0F0F0",
            }}
          >
            <ExpandableText
              text={form.bio}
              style={styles.petBio}
              maxLength={150}
              fallback="No bio provided."
            />
          </View>
        </View>
      </View>

      <View style={styles.contentPadding}>
        {/* 2. HEALTH & BEHAVIOR CARD */}
        <SectionHeader icon="heart-pulse" title="Health and Behavior" />
        <View style={styles.card}>
          {/* CHANGED: All infoRows now contain infoValueContainer for safe wrapping */}
          <View style={styles.infoRow}>
            <InfoLabel icon="needle" title="Vaccination Status" />
            <View style={styles.infoValueContainer}>
              <ExpandableText
                text={form.vaccination}
                style={styles.infoValue}
                maxLength={40}
                align="right"
              />
            </View>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="content-cut" title="Spayed/Neutered" />
            <View style={styles.infoValueContainer}>
              <Text style={[styles.infoValue, { textAlign: "right" }]}>
                {form.sn ? "Yes" : "No"}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="medical-bag" title="Health Condition" />
            <View style={styles.infoValueContainer}>
              <ExpandableText
                text={form.healthCond}
                style={styles.infoValue}
                maxLength={40}
                align="right"
              />
            </View>
          </View>
          <View style={styles.infoRow}>
            <InfoLabel icon="dog" title="Behavior" />
            <View style={styles.infoValueContainer}>
              <ExpandableText
                text={form.behavior}
                style={styles.infoValue}
                maxLength={40}
                align="right"
              />
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <InfoLabel icon="alert-circle-outline" title="Special Needs" />
            <View style={styles.infoValueContainer}>
              <ExpandableText
                text={form.specialNeeds}
                style={styles.infoValue}
                maxLength={40}
                align="right"
              />
            </View>
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
                <ExpandableText
                  text={form.otherInfo}
                  style={styles.petBio}
                  maxLength={150}
                />
              </View>
            </View>
          </>
        )}

        {/* 4. GALLERY SECTION */}
        {form.photos && form.photos.length > 0 && (
          <View
            style={styles.gallerySection}
            onLayout={(e) => handleGalleryLayout(e)}
          >
            <SectionHeader
              icon="image-multiple-outline"
              title="Photo Gallery"
              style={{ marginTop: 0 }}
            />

            <View
              style={[
                styles.card,
                {
                  paddingHorizontal: 0,
                  paddingBottom: isGalleryExpanded ? 0 : Themes.SPACING.md,
                },
              ]}
            >
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
                <View
                  style={[
                    styles.carouselContainer,
                    { marginHorizontal: Themes.SPACING.md },
                  ]}
                  key={`carousel- ${isGalleryExpanded}`}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      const currentPhotoUrl =
                        form.photos[currentPhotoIndex]?.url;
                      if (currentPhotoUrl)
                        handlePressImage(form.photos, currentPhotoIndex);
                    }}
                  >
                    <Image
                      source={{ uri: form.photos[currentPhotoIndex]?.url }}
                      style={styles.carouselImage}
                    />
                  </TouchableOpacity>

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
                              key={`dot-${index}`}
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
                <View
                  style={styles.expandedGalleryContainer}
                  key={`gallery-${isGalleryExpanded}`}
                >
                  {form.photos.map((photo, index) => (
                    <View
                      key={`photo-${photo.key}`}
                      style={styles.photoFeedItem}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handlePressImage(form.photos, index)}
                      >
                        <Image
                          source={{ uri: photo.url }}
                          style={styles.photoFeedImage}
                        />
                      </TouchableOpacity>

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
                        <ExpandableText
                          text={photo.caption}
                          style={styles.photoCardCaption}
                          maxLength={80}
                          fallback="Just being cute! No caption provided yet."
                        />
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
  headerImage: {
    width: "100%",
    resizeMode: "cover",
    aspectRatio: 4 / 3,
  },
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

  // CHANGED: Fixed Flexbox settings to properly wrap dynamic user input
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // changed from center so values expand down, not out
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 16, // prevents label and value from colliding
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0, // prevents label from shrinking when value is huge
  },
  infoValueContainer: {
    flex: 1, // lets the user answer take the remaining space and wrap downward
    alignItems: "flex-end",
  },

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
  expandedGalleryContainer: {
    marginTop: Themes.SPACING.xs,
  },
  photoFeedItem: {
    marginBottom: 0,
  },
  photoFeedContent: {
    padding: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.lg,
    backgroundColor: Themes.COLORS.card,
  },
  photoFeedImage: {
    width: "100%",
    resizeMode: "cover",
    aspectRatio: 4 / 3,
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
