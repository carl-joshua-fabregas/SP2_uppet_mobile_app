import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import * as Themes from "../../../assets/themes/themes";
export default function PCStep1Component({
  petData,
  setPetData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    let newErrors = {};
    // Validate required fields
    if (!petData.name) {
      newErrors.name = "Name is required";
    }
    if (!petData.age) {
      newErrors.age = "Age is required";
    }
    if (isNaN(Number(petData.age))) {
      newErrors.age = "Please enter a valid number for Age";
    }
    if (!petData.sex) {
      newErrors.sex = "Sex is required";
    }
    if (!petData.species) {
      newErrors.species = "Species is required";
    }
    if (!petData.breed) {
      newErrors.breed = "Breed is required";
    }
    if (!petData.bio) {
      newErrors.bio = "Bio is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Proceed to next step
      console.log("Pet Data is valid, proceeding to next step:", petData);
      onNext();
    }
  };
  const SelectionChip = ({ label, value, field }) => (
    <TouchableOpacity
      style={[styles.chip, petData[field] === value && styles.chipActive]}
      onPress={() => update(field, value)}
    >
      <Text
        style={[
          styles.chipText,
          petData[field] === value && styles.chipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.PCStep1ComponentContainer}
      contentContainerStyle={styles.scrollPadding}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholderTextColor="#A9A9A9"
          placeholder="Pet's Name"
          value={petData.name}
          onChangeText={(text) => update("name", text)}
          style={[styles.input, errors.name && styles.inputError]}
        ></TextInput>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Species</Text>
        <TextInput
          placeholderTextColor="#A9A9A9"
          placeholder="Enter Species"
          value={petData.species}
          onChangeText={(text) => update("species", text)}
          style={[styles.input, errors.species && styles.inputError]}
        ></TextInput>
        {errors.species && (
          <Text style={styles.errorText}>{errors.species}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Breed</Text>
        <TextInput
          placeholderTextColor="#A9A9A9"
          placeholder="Enter Breed"
          value={petData.breed}
          onChangeText={(text) => update("breed", text)}
          style={[styles.input, errors.breed && styles.inputError]}
        ></TextInput>
        {errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          placeholderTextColor="#A9A9A9"
          placeholder="Enter Age"
          value={petData.age}
          onChangeText={(text) => update("age", text)}
          keyboardType="numeric"
          style={[styles.input, errors.age && styles.inputError]}
        ></TextInput>
        {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Sex</Text>
        <View style={styles.chipRow}>
          <SelectionChip label="Male" value="male" field="sex"></SelectionChip>
          <SelectionChip
            label="Female"
            value="female"
            field="sex"
          ></SelectionChip>
        </View>
        {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          placeholderTextColor="#A9A9A9"
          scrollEnabled={false}
          placeholder="Enter Bio"
          value={petData.bio}
          multiline={true}
          onChangeText={(text) => update("bio", text)}
          style={[
            styles.input,
            styles.textArea,
            errors.bio && styles.inputError,
          ]}
        ></TextInput>
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  PCStep1ComponentContainer: {
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
  },
  nextButton: {
    flex: 1, // 👈 Takes up the remaining width
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    elevation: 4,
  },
  nextButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
  },
});
