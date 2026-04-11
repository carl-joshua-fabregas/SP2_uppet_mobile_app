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

export default function PetProfileCardViewMore({
  pet,
  onMessagePress,
  buttonProps,
  isOwner,
  editingFooter,
}) {
  const profilePhoto = pet.photos.find((photo) => photo.isProfile === 1);
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
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
          {editingFooter ? (
            editingFooter
          ) : (
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={[
                  styles.primaryButtonContainer,
                  {
                    backgroundColor: buttonProps.color || Themes.COLORS.primary,
                  },
                ]}
                onPress={buttonProps.onPress}
              >
                <Text style={styles.primaryButtonText}>
                  {buttonProps.title}
                </Text>
              </TouchableOpacity>
              {!isOwner && (
                <TouchableOpacity
                  style={[styles.secondaryButtonContainer]}
                  onPress={onMessagePress}
                >
                  <Text style={styles.secondaryButtonText}>Message Owner</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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
});
