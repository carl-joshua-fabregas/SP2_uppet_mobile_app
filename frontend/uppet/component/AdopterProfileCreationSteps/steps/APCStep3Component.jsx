import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Themes from "../../../assets/themes/themes";
import { launchImageLibrary } from "react-native-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";

export default function APCStep3Component({
  adopterData,
  setAdopterData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});
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

  return (
    <View style={styles.APCStep2ComponentContainer}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* OCCUPATION */}
        <View style={styles.field}>
          <Text style={styles.label}>Has Owned a Pet</Text>
          <View style={styles.chipRow}>
            <SelectionChip label="Yes" value="yes" field="hadPets" />
            <SelectionChip label="No" value="no" field="hadPets" />
          </View>
          {errors.hadPets && (
            <Text style={styles.errorText}>{errors.hadPets}</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Currently Owned Pets</Text>
          <TextInput
            style={[styles.input, errors.currentOwnedPets && styles.inputError]}
            value={adopterData.currentOwnedPets}
            onChangeText={(val) => update("currentOwnedPets", val)}
            placeholder="The number of pets you have"
            keyboardType="numeric"
            placeholderTextColor="#A9A9A9"
          />
          {errors.currentOwnedPets && (
            <Text style={styles.errorText}>{errors.currentOwnedPets}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hobbies</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.hobbies && styles.inputError]}
            value={adopterData.hobbies}
            onChangeText={(val) => update("hobbies", val)}
            placeholder="e.g. Hiking, Running, Reading, Indoor Sports"
          />
          {errors.hobbies && (
            <Text style={styles.errorText}>{errors.hobbies}</Text>
          )}
        </View>

        {/* NAVIGATION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next: Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  APCStep2ComponentContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
    padding: 8,
  },
  scrollPadding: { padding: Themes.SPACING.lg, paddingBottom: 50 },
  field: { marginBottom: Themes.SPACING.md },
  row: { flexDirection: "row", alignItems: "flex-start" },
  label: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 14,
    color: Themes.COLORS.primary,
    marginBottom: 6,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputError: { borderColor: "#FF6B6B" },
  errorText: {
    color: "#FF6B6B",
    fontSize: 11, // 👈 Small but readable
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    marginTop: 2, // 👈 Tight gap from the input
    lineHeight: 12, // 👈 Force the container to be thin
    marginLeft: 4,
  },

  // Selection Chips
  chipRow: { flexDirection: "row", height: 50 },
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
});
