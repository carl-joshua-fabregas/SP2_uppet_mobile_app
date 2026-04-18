import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Themes from "../../../assets/themes/themes";
import { launchImageLibrary } from "react-native-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

export default function APCStep3Component({
  adopterData,
  setAdopterData,
  errors,
}) {
  const update = (key, value) =>
    setAdopterData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    let newErrors = {};

    const currentOwnedPetsNum = Number(adopterData.currentOwnedPets, 10);
    if (isNaN(currentOwnedPetsNum)) {
      newErrors.currentOwnedPets = "Current Owned Pets Error";
    }
    if (!adopterData.hadPets.trim()) {
      newErrors.hadPets = "Pet Experience Error";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      onNext();
    }
  };

  const SelectionChip = ({ label, value, field }) => (
    <TouchableOpacity
      style={[styles.chip, adopterData[field] === value && styles.chipActive]}
      onPress={() => update(field, value)}
    >
      <Text
        numberOfLines={1} // 👈 Allows wrapping to 2 lines first
        style={[
          styles.chipText,
          adopterData[field] === value && styles.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  const FormInput = ({
    label,
    value,
    onChange,
    error,
    placeholder,
    multiline,
    height,
    keyboardType,
    icon,
  }) => (
    <View style={styles.field}>
      <View style={styles.infoRow}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={Themes.COLORS.primary}
        ></MaterialCommunityIcons>

        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        placeholderTextColor="#A9A9A9"
        style={[
          styles.input,
          error && styles.inputError,
          multiline && { height, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <View style={styles.APCStep3ComponentContainer}>
      {/* SECTION 1: PET HISTORY */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="history"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Pet History</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="paw-outline"
              size={20}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.label}>Has Owned a Pet Before?</Text>
          </View>
          <View style={styles.chipRow}>
            <SelectionChip label="Yes, I have" value="yes" field="hadPets" />
            <SelectionChip label="No, first time" value="no" field="hadPets" />
          </View>
          {errors.hadPets && (
            <Text style={styles.errorText}>{errors.hadPets}</Text>
          )}
        </View>

        <FormInput
          label="Currently Owned Pets"
          value={String(adopterData.currentOwnedPets || "")}
          onChange={(v) => update("currentOwnedPets", v)}
          error={errors.currentOwnedPets}
          placeholder="0"
          keyboardType="numeric"
          icon="dog-side"
        />
      </View>

      {/* SECTION 2: INTERESTS */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Interests</Text>
        </View>

        <FormInput
          label="Hobbies"
          value={adopterData.hobbies}
          onChange={(v) => update("hobbies", v)}
          error={errors.hobbies}
          placeholder="e.g. Hiking, Running, Reading..."
          multiline
          height={80}
          icon="palette-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  APCStep3ComponentContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
    padding: 8,
  },
  scrollPadding: { padding: Themes.SPACING.lg, paddingBottom: 50 },
  field: { marginBottom: Themes.SPACING.md },
  sectionCard: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Themes.SPACING.sm,
    paddingBottom: Themes.SPACING.xs,
  },
  sectionTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.primary,
    marginLeft: Themes.SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 14,
    color: Themes.COLORS.primary,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    color: "#333",
  },
  inputError: { borderColor: "#FF6B6B" },
  errorText: {
    color: "#FF6B6B",
    fontSize: 11,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    marginTop: 2,
    marginLeft: 4,
  },
  chipRow: { flexDirection: "row", height: 50, marginTop: 4 },
  chip: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1.5,
    borderColor: Themes.COLORS.primary,
  },
  chipText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: "#999",
    fontSize: 14,
  },
  chipTextActive: {
    color: Themes.COLORS.primary,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    paddingVertical: Themes.SPACING.md,
    paddingHorizontal: 25,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
    elevation: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    elevation: 3,
  },
  backButtonText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted,
    fontSize: 16,
  },
  nextButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
  },
});
