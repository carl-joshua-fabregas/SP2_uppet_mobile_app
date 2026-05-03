import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../../../assets/themes/themes";

export default function PCStep2Component({ petData, setPetData, errors }) {
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const SelectionChip = ({ label, value, field }) => (
    <TouchableOpacity
      style={[styles.chip, petData[field] === value && styles.chipActive]}
      onPress={() => update(field, value)}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.chipText,
          petData[field] === value && styles.chipTextActive,
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
        />
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
    <View style={styles.PCStep2ComponentContainer}>
      {/* SECTION 1: PHYSICAL DETAILS */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="scale-bathroom"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Physical Details</Text>
        </View>

        <FormInput
          label="Weight (kg)"
          value={petData.weight}
          onChange={(text) => update("weight", text)}
          error={errors.weight}
          placeholder="e.g. 2.5"
          keyboardType="numeric"
          icon="weight"
        />

        <View style={styles.field}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="ruler"
              size={20}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.label}>Size</Text>
          </View>
          <View style={styles.chipRow}>
            <SelectionChip label="Small" value="Small" field="size" />
            <SelectionChip label="Average" value="Average" field="size" />
            <SelectionChip label="Big" value="Big" field="size" />
          </View>
          {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
        </View>
      </View>

      {/* SECTION 2: HEALTH STATUS */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="medical-bag"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Medical History</Text>
        </View>

        <View style={styles.field}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="needle"
              size={20}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.label}>Vaccinated?</Text>
          </View>
          <View style={styles.chipRow}>
            <SelectionChip
              label="Not Vaccinated"
              value="Not Vaccinated"
              field="vaccination"
            />
            <SelectionChip
              label="Not Updated"
              value="Not Updated"
              field="vaccination"
            />
            <SelectionChip
              label="Up-to-Date"
              value="Up-to-Date"
              field="vaccination"
            />
          </View>
          {errors.vaccination && (
            <Text style={styles.errorText}>{errors.vaccination}</Text>
          )}
        </View>

        <View style={styles.field}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="content-cut"
              size={20}
              color={Themes.COLORS.primary}
            />
            <Text style={styles.label}>Spayed/Neutered</Text>
          </View>
          <View style={styles.chipRow}>
            <SelectionChip label="Yes" value="yes" field="sn" />
            <SelectionChip label="No" value="no" field="sn" />
          </View>
          {errors.sn && <Text style={styles.errorText}>{errors.sn}</Text>}
        </View>

        <FormInput
          label="Health Condition"
          value={petData.healthCond}
          onChange={(text) => update("healthCond", text)}
          error={errors.healthCond}
          placeholder="Any allergies or medical history?"
          multiline
          height={80}
          icon="heart-pulse"
        />

        <FormInput
          label="Special Needs"
          value={petData.specialNeeds}
          onChange={(text) => update("specialNeeds", text)}
          error={errors.specialNeeds}
          placeholder="Wheelchair, medication, etc."
          multiline
          height={80}
          icon="wheelchair-accessibility"
        />
      </View>

      {/* SECTION 3: PERSONALITY */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="head-heart-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Behavior & Extra</Text>
        </View>

        <FormInput
          label="Behavior"
          value={petData.behavior}
          onChange={(text) => update("behavior", text)}
          error={errors.behavior}
          placeholder="Playful, quiet, aggressive with other dogs?"
          multiline
          height={80}
          icon="dog-side"
        />

        <FormInput
          label="Other Information"
          value={petData.otherInfo}
          onChange={(text) => update("otherInfo", text)}
          error={errors.otherInfo}
          placeholder="Any additional information?"
          multiline
          height={80}
          icon="information-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  PCStep2ComponentContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  scrollPadding: { padding: Themes.SPACING.lg, paddingBottom: 50 },
  field: { marginBottom: Themes.SPACING.md },

  // App-standard cards
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
  row: { flexDirection: "row", alignItems: "flex-start" },
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
    lineHeight: 12,
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
    textAlign: "center",
  },
  chipTextActive: {
    color: Themes.COLORS.primary,
    fontWeight: "bold",
  },
});
