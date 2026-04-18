import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useState } from "react";
import * as Themes from "../../../assets/themes/themes";
export default function APCStep1Component({
  adopterData,
  setAdopterData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setAdopterData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    const newErrors = {};
    if (!adopterData.firstName.trim()) {
      newErrors.firstName = "First Name Error";
    }
    if (!adopterData.middleName.trim()) {
      newErrors.middleName = "Middle Name Error";
    }
    if (!adopterData.lastName.trim()) {
      newErrors.lastName = "Last Name Error";
    }
    if (!adopterData.address.trim()) {
      newErrors.address = "Address Error";
    }
    if (!adopterData.bio.trim()) {
      newErrors.bio = "Bio Error";
    }
    const ageNum = Number(adopterData.age, 10);
    if (isNaN(ageNum)) {
      newErrors.age = "Age Error";
    }
    if (!adopterData.gender.trim()) {
      newErrors.gender = "Gender Error";
    }
    if (!adopterData.contactInfo.trim()) {
      newErrors.contactInfo = "Contact Info Error";
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
    <View style={styles.APCStep1ComponentContainer}>
      <ScrollView contentContainerStyle={styles.scrollPadding}>
        {/* PROFILE PICTURE UPLOAD */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={() => console.log("PICK IMAGE")}
            style={styles.avatarContainer}
          >
            {adopterData.profilePicture ? (
              <Image
                source={{ uri: adopterData.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.placeholderText}>+</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Upload Profile Picture</Text>
        </View>
        {/* FIRST NAME */}
        <View style={styles.field}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.firstName && styles.inputError]}
            value={adopterData.firstName}
            onChangeText={(val) => update("firstName", val)}
            placeholder="e.g. Juan"
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        {/* MIDDLE NAME (Optional) */}
        <View style={styles.field}>
          <Text style={styles.label}>Middle Name (Optional)</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={styles.input}
            value={adopterData.middleName}
            onChangeText={(val) => update("middleName", val)}
            placeholder="e.g. Protacio"
          />
        </View>

        {/* LAST NAME */}
        <View style={styles.field}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.lastName && styles.inputError]}
            value={adopterData.lastName}
            onChangeText={(val) => update("lastName", val)}
            placeholder="e.g. Dela Cruz"
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>

        {/* AGE */}
        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.age && styles.inputError]}
            value={adopterData.age ? String(adopterData.age) : ""}
            onChangeText={(val) => update("age", val)}
            keyboardType="numeric"
            placeholder="Must be 18+"
          />
          {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
        </View>

        {/* GENDER SELECTION */}
        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            <SelectionChip label="Male" value="male" field="gender" />
            <SelectionChip label="Female" value="female" field="gender" />
            <SelectionChip label="Other" value="other" field="gender" />
          </View>
          {errors.gender && (
            <Text style={styles.errorText}>{errors.gender}</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.address && styles.inputError]}
            value={adopterData.address}
            onChangeText={(val) => update("address", val)}
            placeholder="Enter Address"
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Contact Information</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            style={[styles.input, errors.contactInfo && styles.inputError]}
            value={adopterData.contactInfo}
            onChangeText={(val) => update("contactInfo", val)}
            keyboardType="numeric"
            placeholder="Enter Contact Information"
          />
          {errors.contactInfo && (
            <Text style={styles.errorText}>{errors.contactInfo}</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            placeholderTextColor="#A9A9A9"
            scrollEnabled={false}
            placeholder="Enter Bio"
            value={adopterData.bio}
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
        {/* NAVIGATION BUTTONS */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next: Work & Living</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    color: Themes.COLORS.primary,
  },
});
