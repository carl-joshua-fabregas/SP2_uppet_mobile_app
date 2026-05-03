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

export default function PCStep1Component({ petData, setPetData, errors }) {
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

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
    <View style={styles.PCStep1ComponentContainer}>
      {/* SECTION 1: BASIC INFORMATION */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="paw"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>

        <FormInput
          label="Name"
          value={petData.name}
          onChange={(text) => update("name", text)}
          error={errors.name}
          placeholder="Pet's Name"
          icon="tag-text-outline"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <FormInput
              label="Species"
              value={petData.species}
              onChange={(text) => update("species", text)}
              error={errors.species}
              placeholder="e.g. Dog"
              icon="cat"
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <FormInput
              label="Breed"
              value={petData.breed}
              onChange={(text) => update("breed", text)}
              error={errors.breed}
              placeholder="e.g. Aspin"
              icon="dna"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <FormInput
              label="Age"
              value={petData.age}
              onChange={(text) => update("age", text)}
              error={errors.age}
              placeholder="e.g. 2"
              keyboardType="numeric"
              icon="calendar"
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="gender-male-female"
                size={20}
                color={Themes.COLORS.primary}
              />
              <Text style={styles.label}>Sex</Text>
            </View>
            <View style={styles.chipRow}>
              <SelectionChip label="Male" value="male" field="sex" />
              <SelectionChip label="Female" value="female" field="sex" />
            </View>
            {errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}
          </View>
        </View>
      </View>

      {/* SECTION 2: BIOGRAPHY */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="card-text-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>About</Text>
        </View>

        <FormInput
          label="Bio"
          value={petData.bio}
          onChange={(text) => update("bio", text)}
          error={errors.bio}
          placeholder="Tell us about this pet..."
          multiline
          height={100}
          icon="comment-text-outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  PCStep1ComponentContainer: {
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
  },
  chipTextActive: {
    color: Themes.COLORS.primary,
    fontWeight: "bold",
  },
});
