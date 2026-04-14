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

export default function APCStep2Component({
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
    // Validate required fields

    if (!adopterData.occupation.trim()) {
      newErrors.occupation = "Occupation Error";
    }
    const incomeNum = Number(adopterData.income, 10);
    if (isNaN(incomeNum)) {
      newErrors.income = "Income Error";
    }
    if (!adopterData.livingCon.trim()) {
      newErrors.livingCon = "Living Condition Error";
    }
    if (!adopterData.lifeStyle.trim()) {
      newErrors.lifeStyle = "LifeStyle Error";
    }
    const householdMem = Number(adopterData.householdMem, 10);
    if (isNaN(householdMem)) {
      newErrors.householdMem = "Household Members Error";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      // Proceed to next step

      console.log("Pet Data is valid, proceeding to next step:", adopterData);
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
          <Text style={styles.label}>Occupation</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.occupation && styles.inputError]}
            value={adopterData.occupation}
            onChangeText={(val) => update("occupation", val)}
            placeholder="e.g. Software Developer"
          />
          {errors.occupation && (
            <Text style={styles.errorText}>{errors.occupation}</Text>
          )}
        </View>

        {/* MONTHLY INCOME */}
        <View style={styles.field}>
          <Text style={styles.label}>Estimated Monthly Income (PHP)</Text>
          <TextInput
            style={[styles.input, errors.income && styles.inputError]}
            value={adopterData.income}
            onChangeText={(val) => update("income", val)}
            keyboardType="numeric"
            placeholder="e.g. 25000"
            placeholderTextColor="#A9A9A9"
          />
          {errors.income && (
            <Text style={styles.errorText}>{errors.income}</Text>
          )}
        </View>

        {/* LIVING CONDITION */}
        <View style={styles.field}>
          <Text style={styles.label}>Living Condition</Text>
          <View style={styles.chipRow}>
            <SelectionChip label="House" value="House" field="livingCon" />
            <SelectionChip
              label="Apartment"
              value="Apartment"
              field="livingCon"
            />
            <SelectionChip label="Condo" value="Condo" field="livingCon" />
          </View>
          {errors.livingCon && (
            <Text style={styles.errorText}>{errors.livingCon}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Number of people in the Household</Text>
          <TextInput
            style={[styles.input, errors.householdMem && styles.inputError]}
            value={adopterData.householdMem}
            onChangeText={(val) => update("householdMem", val)}
            keyboardType="numeric"
            placeholder="e.g. 2"
            placeholderTextColor="#A9A9A9"
          />
          {errors.householdMem && (
            <Text style={styles.errorText}>{errors.householdMem}</Text>
          )}
        </View>

        {/* LIFESTYLE */}
        <View style={styles.field}>
          <Text style={styles.label}>Lifestyle Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.lifeStyle && styles.inputError,
            ]}
            value={adopterData.lifeStyle}
            onChangeText={(val) => update("lifeStyle", val)}
            multiline={true}
            numberOfLines={4}
            placeholderTextColor="#A9A9A9"
            placeholder="e.g. I work from home and enjoy morning walks. I have a fenced yard..."
          />
          {errors.lifeStyle && (
            <Text style={styles.errorText}>{errors.lifeStyle}</Text>
          )}
        </View>

        {/* NAVIGATION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next: Pet Experience</Text>
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
