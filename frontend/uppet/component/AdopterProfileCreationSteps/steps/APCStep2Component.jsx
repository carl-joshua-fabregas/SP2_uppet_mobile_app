import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import * as Themes from "../../../assets/themes/themes";

export default function APCStep2Component({
  adopterData,
  setAdopterData,
  errors,
}) {
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
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="briefcase-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Work & Finance</Text>
        </View>

        <FormInput
          label="Occupation"
          value={adopterData.occupation}
          onChange={(v) => update("occupation", v)}
          error={errors.occupation}
          placeholder="e.g. Software Developer"
          icon="card-account-details-outline"
        />

        <FormInput
          label="Monthly Income (PHP)"
          value={String(adopterData.income || "")}
          onChange={(v) => update("income", v)}
          error={errors.income}
          placeholder="e.g. 25000"
          keyboardType="numeric"
          icon="cash-multiple"
        />
      </View>

      {/* SECTION 2: LIVING SITUATION */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="home-city-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Living Situation</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="home-variant-outline"
              size={20}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.label}>Living Condition</Text>
          </View>
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

        <FormInput
          label="Household Members"
          value={String(adopterData.householdMem || "")}
          onChange={(v) => update("householdMem", v)}
          error={errors.householdMem}
          placeholder="Number of people living with you"
          keyboardType="numeric"
          icon="account-group-outline"
        />
      </View>

      {/* SECTION 3: LIFESTYLE */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="run-fast"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Lifestyle</Text>
        </View>

        <FormInput
          label="Lifestyle Description"
          value={adopterData.lifeStyle}
          onChange={(v) => update("lifeStyle", v)}
          error={errors.lifeStyle}
          placeholder="e.g. I work from home and enjoy morning walks..."
          multiline
          height={100}
          icon="clipboard-text-outline"
        />
      </View>
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
