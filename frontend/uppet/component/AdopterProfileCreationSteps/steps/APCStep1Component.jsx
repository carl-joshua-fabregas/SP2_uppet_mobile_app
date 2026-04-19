import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import * as Themes from "../../../assets/themes/themes";
import { launchImageLibrary } from "react-native-image-picker";

export default function APCStep1Component({
  adopterData,
  setAdopterData,
  errors,
}) {
  // const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setAdopterData((prev) => ({ ...prev, [key]: value }));

  const handleAddPhoto = () => {
    console.log("Adding Adopter Profile Picture");
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
        selectionLimit: 1,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("The user has cancelled selection");
        } else if (response.errorCode) {
          console.log(
            "I have issues and one of them is you",
            response.errorCode,
          );
        } else {
          const asset = response.assets;
          const newProfilePicture = {
            url: asset[0].uri,
            name: asset[0].fileName,
            type: asset[0].type,
            key: asset[0].fileName + asset[0].fileSize,
          };
          console.log("Selected zucc", newProfilePicture);
          update("profilePhoto", newProfilePicture);
          console.log("Update zucc", adopterData);
        }
      },
    );
  };
  const SelectionChip = ({ label, value, field }) => (
    <TouchableOpacity
      style={[styles.chip, adopterData[field] === value && styles.chipActive]}
      onPress={() => update(field, value)}
    >
      <Text
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
    <View style={styles.APCStep1ComponentContainer}>
      {/* PROFILE PICTURE UPLOAD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="account-details"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Profile Picture</Text>
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={handleAddPhoto}
            style={[
              styles.avatarContainer,
              adopterData.profilePhoto && { borderStyle: "solid" },
              errors.profilePhoto && [styles.inputError],
            ]}
          >
            {adopterData.profilePhoto ? (
              <Image
                source={{ uri: adopterData.profilePhoto.url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={32}
                  color={Themes.COLORS.primary}
                />
              </View>
            )}
          </TouchableOpacity>
          <Text
            style={[
              styles.avatarLabel,
              errors.profilePhoto && styles.errorText,
            ]}
          >
            Upload Profile Picture
          </Text>
        </View>
      </View>
      {/* Personal Information */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="account-box"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Personal Information</Text>
        </View>
        <FormInput
          label="First Name"
          value={adopterData.firstName}
          onChange={(v) => update("firstName", v)}
          error={errors.firstName}
          placeholder="Juan"
        />
        <FormInput
          label="Last Name"
          value={adopterData.lastName}
          onChange={(v) => update("lastName", v)}
          error={errors.lastName}
          placeholder="Dela Cruz"
        />
        <FormInput
          label="Middle Name (Optional)"
          value={adopterData.middleName}
          onChange={(v) => update("middleName", v)}
          placeholder="Protacio"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <FormInput
              label="Age"
              value={String(adopterData.age ?? "")}
              onChange={(v) => update("age", v)}
              error={errors.age}
              placeholder="18+"
              keyboardType="numeric"
              icon="calendar-account"
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="gender-male-female"
                size={20}
                color={Themes.COLORS.primary}
              ></MaterialCommunityIcons>
              <Text style={styles.label}>Gender</Text>
            </View>
            <View style={styles.chipRow}>
              <SelectionChip label="M" value="male" field="gender" />
              <SelectionChip label="F" value="female" field="gender" />
              <SelectionChip label="Other" value="other" field="gender" />
            </View>
            {errors.gender && (
              <Text style={styles.errorText}> {errors.gender} </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Contact & Location</Text>
        </View>
        <FormInput
          label="Home Address"
          value={adopterData.address}
          onChange={(v) => update("address", v)}
          error={errors.address}
          placeholder="Barangay, City, Province"
          icon="hoop-house"
        />
        <FormInput
          label="Contact Number"
          value={adopterData.contactInfo}
          onChange={(v) => update("contactInfo", v)}
          error={errors.contactInfo}
          placeholder="0912 345 6789"
          keyboardType="numeric"
          icon="phone-outline"
        />
      </View>

      {/* SECTION 3: BIO CARD */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="text-account"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>About You</Text>
        </View>
        <FormInput
          label="Bio"
          value={adopterData.bio}
          onChange={(v) => update("bio", v)}
          error={errors.bio}
          placeholder="Tell us why you'd like to adopt..."
          multiline
          height={100}
          icon="comment-account"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  APCStep1ComponentContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
    padding: 8,
  },
  scrollPadding: { padding: Themes.SPACING.lg, paddingBottom: 50 },
  field: { marginBottom: Themes.SPACING.md },
  scrollPadding: { padding: 16, paddingBottom: 40 },
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
  content: {
    padding: Themes.SPACING.md,
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
  avatarSection: {
    alignItems: "center",
    marginBottom: Themes.SPACING.lg,
    marginTop: Themes.SPACING.sm,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: Themes.COLORS.primary,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 40,
    color: Themes.COLORS.primary,
    fontWeight: "300",
  },
  avatarLabel: {
    marginTop: 8,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.primaryDark,
  },
});
