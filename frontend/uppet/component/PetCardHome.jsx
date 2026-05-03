import { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

export default function PetCardHome({ pet, onPress }) {
  const photo = pet.photos?.find((photo) => photo.isProfile);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image
        source={
          photo ? { uri: photo.url } : require("../assets/images/doggoe.jpg")
        }
        style={styles.imageStyle}
      />

      <View style={styles.petDetailsContainer}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>
          {pet.species ? `${pet.species} • ` : ""}
          {pet.breed} • {pet.sex}
        </Text>

        {/* Simplified Stats Row mimicking the Profile Card */}
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStatItem}>
            <MaterialCommunityIcons
              name="calendar-clock"
              size={14}
              color={Themes.COLORS.textMuted}
            />
            <Text style={styles.miniStatText}>{pet.age} yrs</Text>
          </View>
          {pet.size ? (
            <View style={styles.miniStatItem}>
              <MaterialCommunityIcons
                name="ruler"
                size={14}
                color={Themes.COLORS.textMuted}
              />
              <Text style={styles.miniStatText}>{pet.size}</Text>
            </View>
          ) : null}

          {/* FIXED: Changed && to ternary ? : null */}
          {pet.weight ? (
            <View style={styles.miniStatItem}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={14}
                color={Themes.COLORS.textMuted}
              />
              <Text style={styles.miniStatText}>{pet.weight}kg</Text>
            </View>
          ) : null}
        </View>

        {/* Inline About Me */}
        <Text style={styles.petBio} numberOfLines={2}>
          <MaterialCommunityIcons
            name="paw"
            size={14}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.aboutMeLabel}> About me: </Text>
          {pet.bio ? pet.bio : "No bio provided."}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: "hidden",
    flex: 1,
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
    marginBottom: 2,
  },
  petBreed: {
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.COLORS.primary, // Updated to match profile primary color
    marginBottom: Themes.SPACING.sm,
  },
  miniStatsRow: {
    flexDirection: "row",
    gap: Themes.SPACING.sm,
    marginBottom: Themes.SPACING.sm,
    flexWrap: "wrap",
  },
  miniStatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Themes.COLORS.soft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Themes.RADIUS.sm,
    gap: 4,
  },
  miniStatText: {
    fontSize: 12,
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
    color: Themes.COLORS.textDark,
  },
  petBio: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.TYPOGRAPHY.body.color,
    lineHeight: 18,
    marginTop: 4,
  },
  aboutMeLabel: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.COLORS.primary,
  },
});
