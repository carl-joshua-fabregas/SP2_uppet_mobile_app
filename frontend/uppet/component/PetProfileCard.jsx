import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";

export default function PetProfileCardViewMore({ pet }) {
  const profilePhoto = pet.photos && pet.photos.length > 0 
    ? pet.photos.find((photo) => photo.isProfile) 
    : null;
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
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
  return (
    <View style={styles.profileContainer}>
      <Image
        source={
          profilePhoto
            ? { uri: profilePhoto.url }
            : require("../assets/images/doggoe.jpg")
        }
        style={styles.imageStyle}
      />
      <View style={styles.contentPadding}>
        {/* identifiers */}
        <Text style={styles.petName}>{form.name}</Text>
        <Text style={styles.petBreed}>
          {form.breed} • {form.sex}
        </Text>
        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>{form.age} years old</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Size</Text>
            <Text style={styles.statValue}>{form.size}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{form.weight}kg</Text>
          </View>
        </View>
        {/* Bio */}
        <Text style={styles.sectionTitle}>Bio</Text>
        <Text style={styles.petBio}>{form.bio}</Text>
        {/* Technical Information */}
        <Text style={styles.sectionTitle}>Health and Behavior</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Vaccination Status</Text>
          <Text style={styles.infoValue}>{form.vaccination}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Spayed/Neutered</Text>
          <Text style={styles.infoValue}>{form.sn ? "Yes" : "No"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Health Condition</Text>
          <Text style={styles.infoValue}>{form.healthCond || "None"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Behavior</Text>
          <Text style={styles.infoValue}>{form.behavior}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Special Needs</Text>
          <Text style={styles.infoValue}>{form.specialNeeds || "None"}</Text>
        </View>
        {/* Additional Info */}
        {pet.otherInfo && (
          <>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.petBio}>{form.otherInfo}</Text>
          </>
        )}

        {/* Gallery Section */}
        {form.photos && form.photos.length > 0 && (
          <View style={styles.gallerySection}>
            <View style={styles.galleryHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              {form.photos.length > 3 && (
                <TouchableOpacity onPress={() => setIsGalleryExpanded((prev) => !prev)}>
                  <Text style={styles.galleryToggleButton}>
                    {isGalleryExpanded ? "Show Less" : "View More..."}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isGalleryExpanded ? (
              <View key={`carousel-${isGalleryExpanded}`} style={[styles.carouselContainer, { width: "100%" }] }>
                <Image 
                  key={`carousel-${currentPhotoIndex}-${isGalleryExpanded}`}
                  source={{ uri: form.photos[currentPhotoIndex]?.url }} 
                  style={styles.carouselImage} 
                />
                {form.photos.length > 1 && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                    <TouchableOpacity 
                      style={styles.carouselPrevButton} 
                      onPress={() => setCurrentPhotoIndex(prev => prev === 0 ? form.photos.length - 1 : prev - 1)}
                    >
                      <Text style={styles.carouselArrow}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.carouselNextButton} 
                      onPress={() => setCurrentPhotoIndex(prev => prev === form.photos.length - 1 ? 0 : prev + 1)}
                    >
                      <Text style={styles.carouselArrow}>›</Text>
                    </TouchableOpacity>
                    <View style={styles.carouselDotsContainer}>
                      {form.photos.map((_, index) => (
                        <View 
                          key={index} 
                          style={[
                            styles.carouselDot, 
                            index === currentPhotoIndex && styles.carouselDotActive
                          ]} 
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.expandedGalleryContainer}>
                <ScrollView 
                  style={styles.expandedGalleryScroll} 
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.photoCardsList}>
                    {form.photos.map((photo, index) => (
                      <View key={index} style={styles.photoCard}>
                        <Image 
                          source={{ uri: photo.url }} 
                          style={styles.photoCardImage} 
                        />
                        <View style={styles.photoCardContent}>
                          <Text style={styles.photoCardTitle}>🐾 About this photo</Text>
                          <Text style={styles.photoCardCaption}>
                            {photo.caption || "Just being cute! No caption provided yet."}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <TouchableOpacity 
                  style={styles.closeGalleryButton}
                  onPress={() => setIsGalleryExpanded(false)}
                >
                  <Text style={styles.closeGalleryButtonText}>Close Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
// {editingFooter ? (
//             editingFooter
//           ) : (
//             <View style={styles.buttonSection}>
//               <TouchableOpacity
//                 style={[
//                   styles.primaryButtonContainer,
//                   {
//                     backgroundColor: buttonProps.color || Themes.COLORS.primary,
//                   },
//                 ]}
//                 onPress={buttonProps.onPress}
//               >
//                 <Text style={styles.primaryButtonText}>
//                   {buttonProps.title}
//                 </Text>
//               </TouchableOpacity>
//               {!isOwner && (
//                 <TouchableOpacity
//                   style={[styles.secondaryButtonContainer]}
//                   onPress={onMessagePress}
//                 >
//                   <Text style={styles.secondaryButtonText}>Message Owner</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           )}
const styles = StyleSheet.create({
  profileContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },

  imageStyle: {
    resizeMode: "cover",
    width: "100%",
    height: 300,
  },
  petDetailsContainer: {
    padding: Themes.SPACING.md,
  },
  petName: {
    fontSize: 32,
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
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.TYPOGRAPHY.subsubheading.color,
  },
  contentPadding: {
    padding: Themes.SPACING.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Themes.SPACING.sm,
  },
  statItem: {
    width: "30%",
    backgroundColor: Themes.COLORS.soft,
    padding: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.sm,
    alignItems: "center",
    marginTop: Themes.SPACING.sm,
  },
  statLabel: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    color: Themes.TYPOGRAPHY.label.color,
  },
  statValue: {
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.TYPOGRAPHY.subsubheading.color,
  },
  sectionTitle: {
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    color: Themes.COLORS.primary,
    marginTop: Themes.SPACING.md,
    marginBottom: Themes.SPACING.xs,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: "#888",
  },
  infoValue: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textDark,
  },
  primaryButtonContainer: {
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    textAlign: "center",
  },
  secondaryButtonContainer: {
    backgroundColor: "#A5D6A7",
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY.subheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    textAlign: "center",
  },
  buttonSection: {
    marginTop: Themes.SPACING.lg,
    gap: Themes.SPACING.md,
    width: "100%",
  },
  gallerySection: {
    marginTop: Themes.SPACING.sm,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  galleryToggleButton: {
    color: Themes.COLORS.primary,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    marginTop: Themes.SPACING.md,
  },
  carouselContainer: {
    marginTop: Themes.SPACING.xs,
    position: "relative",
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
    marginTop: -20, // Half of button height to center
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
    height: 350,
    backgroundColor: Themes.COLORS.soft,
    borderRadius: Themes.RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  expandedGalleryScroll: {
    flex: 1,
    padding: Themes.SPACING.sm,
  },
  photoCardsList: {
    paddingBottom: 70, // Space for the floating button
  },
  photoCard: {
    backgroundColor: "#fff",
    borderRadius: 20, // Extra rounded for cuteness
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: Themes.SPACING.lg,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  photoCardImage: {
    width: "100%",
    height: 280, // A bit taller to show off the pet
    resizeMode: "cover",
  },
  photoCardContent: {
    padding: Themes.SPACING.md,
    backgroundColor: "#FFF9F2", // A warm, soft cutesy background color
    borderTopWidth: 1,
    borderTopColor: "#FDEFE2",
  },
  photoCardTitle: {
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.xs,
    fontWeight: "600",
  },
  photoCardCaption: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: "#555",
    lineHeight: 22,
    fontStyle: "italic", // Gives it a scrapbook journal feel
  },
  closeGalleryButton: {
    position: "absolute",
    bottom: Themes.SPACING.md,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.lg,
    borderRadius: Themes.RADIUS.pill,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeGalleryButtonText: {
    color: "#fff",
    fontFamily: Themes.TYPOGRAPHY.subheading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
  },
});
