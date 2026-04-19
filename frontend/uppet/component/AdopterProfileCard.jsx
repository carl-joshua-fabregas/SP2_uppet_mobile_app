import { Text, Image, View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Themes from "../assets/themes/themes";

export default function ProfileCard({ adopter, isOwner, handleEditing }) {
  console.log("PROFILE CARD CLICKED");
  // Section Component for cleaner code
  const InfoSection = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={Themes.COLORS.primary}
        />
      </View>
      <View style={styles.textData}>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.valueText}>{value || "Not specified"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={
            adopter.profilePhoto
              ? { uri: adopter.profilePhoto.url }
              : require("../assets/images/doggoe.jpg")
          } // Use adopter.profilePic if available
          style={styles.profileImage}
        />
        <Text style={styles.fullName}>
          {adopter.firstName}{" "}
          {adopter.middleName ? adopter.middleName + " " : ""}
          {adopter.lastName}
        </Text>
        <Text style={styles.bioText}>{adopter.bio || "No bio added yet."}</Text>

        {/* Edit Button - Only shows if isOwner is true */}
        {isOwner && (
          <TouchableOpacity style={styles.editButton} onPress={handleEditing}>
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#FFF"
            />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Details Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <InfoSection
            icon="calendar-account"
            label="Age"
            value={`${adopter.age} years old`}
          />
          <InfoSection
            icon="gender-male-female"
            label="Gender"
            value={adopter.gender}
          />
          <InfoSection
            icon="map-marker-outline"
            label="Address"
            value={adopter.address}
          />
          <InfoSection
            icon="phone-outline"
            label="Contact Info"
            value={adopter.contactInfo}
          />
        </View>

        <Text style={styles.sectionTitle}>Work & Lifestyle</Text>
        <View style={styles.card}>
          <InfoSection
            icon="briefcase-outline"
            label="Occupation"
            value={adopter.occupation}
          />
          <InfoSection
            icon="cash"
            label="Income Bracket"
            value={adopter.income}
          />
          <InfoSection
            icon="home-city-outline"
            label="Living Condition"
            value={adopter.livingCon}
          />
          <InfoSection icon="run" label="Lifestyle" value={adopter.lifeStyle} />
          <InfoSection
            icon="human-male-female-child"
            label="Household Members"
            value={adopter.householdMem}
          />
        </View>

        <Text style={styles.sectionTitle}>Pet Experience</Text>
        <View style={styles.card}>
          <InfoSection
            icon="history"
            label="Has had pets before?"
            value={adopter.hadPets ? "Yes, I have" : "First-time owner"}
          />
          <InfoSection
            icon="paw"
            label="Currently Owned Pets"
            value={adopter.currentOwnedPets}
          />
          <InfoSection
            icon="heart-outline"
            label="Hobbies"
            value={adopter.hobbies}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  header: {
    alignItems: "center",
    padding: Themes.SPACING.lg,
    backgroundColor: Themes.COLORS.card,
    borderBottomLeftRadius: Themes.RADIUS.lg,
    borderBottomRightRadius: Themes.RADIUS.lg,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
  },
  fullName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.text,
    textAlign: "center",
  },
  bioText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textFaded,
    textAlign: "center",
    marginTop: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.primary,
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.md,
    marginTop: Themes.SPACING.md,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: Themes.SPACING.sm,
  },
  content: {
    padding: Themes.SPACING.md,
  },
  sectionTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
    marginTop: Themes.SPACING.md,
    marginLeft: Themes.SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginBottom: Themes.SPACING.sm,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Themes.SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: Themes.COLORS.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  textData: {
    marginLeft: Themes.SPACING.md,
    flex: 1,
  },
  labelText: {
    fontSize: Themes.TYPOGRAPHY.label.fontSize,
    color: Themes.COLORS.textFaded,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
  valueText: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.text,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    marginTop: 2,
  },
});
