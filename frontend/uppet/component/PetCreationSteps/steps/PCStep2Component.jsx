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

export default function PCStep2Component({
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

    if (!petData.size) {
      newErrors.size = "Size is required";
    }
    if (!petData.vaccination) {
      newErrors.vaccination = "Vaccination status is required";
    }
    if (isNaN(Number(petData.weight))) {
      newErrors.weight = "Please enter a valid number for Weight";
    }
    if (!petData.sex) {
      newErrors.sex = "Please specify sex";
    }
    if (!petData.sn) {
      newErrors.sn = "Please specify if your pet is spayed/neutered";
    }
    if (!petData.specialNeeds) {
      newErrors.specialNeeds = "Please Put NA";
    }
    if (!petData.healthCond) {
      newErrors.healthCond = "Health condition is required";
    }
    if (!petData.behavior) {
      newErrors.behavior = "Behavior is required";
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
        numberOfLines={1} // 👈 Allows wrapping to 2 lines first
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
        <Text style={styles.label}>Weight (kg) </Text>
        <TextInput
          placeholder="e.g 2.5"
          placeholderTextColor="#A9A9A9"
          keyboardType="numeric"
          value={petData.weight}
          onChangeText={(text) => update("weight", text)}
          style={[styles.input, errors.weight && styles.inputError]}
        ></TextInput>
        {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Size</Text>
        <View style={styles.chipRow}>
          <SelectionChip
            label={"Small"}
            value="Small"
            field="size"
          ></SelectionChip>
          <SelectionChip
            label={"Average"}
            value="Average"
            field="size"
          ></SelectionChip>
          <SelectionChip label={"Big"} value="Big" field="size"></SelectionChip>
        </View>
        {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Vaccinated?</Text>
        <View style={styles.chipRow}>
          <SelectionChip
            label={"Not Vaccinated"}
            value="Not Vaccinated"
            field="vaccination"
          ></SelectionChip>
          <SelectionChip
            label={"Not Updated"}
            value="Not Updated"
            field="vaccination"
          ></SelectionChip>
          <SelectionChip
            label={"Up-to-Date"}
            value="Up-to-Date"
            field="vaccination"
          ></SelectionChip>
        </View>
        {errors.vaccination && (
          <Text style={styles.errorText}>{errors.vaccination}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Spayed/Neutered</Text>
        <View style={styles.chipRow}>
          <SelectionChip label="Yes" value="yes" field="sn"></SelectionChip>
          <SelectionChip label="No" value="no" field="sn"></SelectionChip>
        </View>
        {errors.sn && <Text style={styles.errorText}>{errors.sn}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Health Condition</Text>
        <TextInput
          placeholder="Any allergies or medical history?"
          placeholderTextColor="#A9A9A9"
          value={petData.healthCond}
          onChangeText={(text) => update("healthCond", text)}
          multiline={true}
          style={[styles.input, errors.healthCond && styles.inputError]}
        ></TextInput>
        {errors.healthCond && (
          <Text style={styles.errorText}>{errors.healthCond}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Behavior</Text>
        <TextInput
          placeholder="Playful, quiet, aggressive with other dogs?"
          placeholderTextColor="#A9A9A9"
          value={petData.behavior}
          onChangeText={(text) => update("behavior", text)}
          multiline={true}
          style={[styles.input, errors.behavior && styles.inputError]}
        ></TextInput>
        {errors.behavior && (
          <Text style={styles.errorText}>{errors.behavior}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Special Needs</Text>
        <TextInput
          placeholder="Wheelchair, medication, etc."
          placeholderTextColor="#A9A9A9"
          value={petData.specialNeeds}
          multiline={true}
          onChangeText={(text) => update("specialNeeds", text)}
          style={[styles.input, errors.specialNeeds && styles.inputError]}
        ></TextInput>
        {errors.specialNeeds && (
          <Text style={styles.errorText}>{errors.specialNeeds}</Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Other Information</Text>
        <TextInput
          placeholder="If there is any other information?"
          placeholderTextColor="#A9A9A9"
          value={petData.otherInfo}
          multiline={true}
          onChangeText={(text) => update("otherInfo", text)}
          style={[styles.input, errors.otherInfo && styles.inputError]}
        ></TextInput>
        {errors.otherInfo && (
          <Text style={styles.errorText}>{errors.otherInfo}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  PCStep2ComponentContainer: {
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
