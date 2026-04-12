import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";

export default function ViewAdopteesCard({ pet }) {
  const navigation = useNavigation();
  const isAvailable = pet.adoptedStatus === 1;
  const statusTextColor = isAvailable ? "#D97706" : Themes.COLORS.badgeText;
  const statusBg = isAvailable ? "#FFF4E0" : Themes.COLORS.badge;

  console.log("THIS IS AN ID", pet._id);

  const onViewApplicantPress = () => {
    console.log("View My adoptees card is pressed", pet._id);
    navigation.navigate("viewApplicantsMyAdoptees", { petID: pet._id });
  };

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate("viewPetProfile", { pet: pet })}
      activeOpacity={0.8}
    >
      {/* Pet Thumbnail */}
      <Image
        source={
          pet.photos?.[0]?.url
            ? { uri: pet.photos[0].url }
            : require("../assets/images/doggoe.jpg")
        }
        style={styles.petImage}
      />
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.petName} numberOfLines={1}>
            {pet.name}
          </Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusTextColor }]}>
              {isAvailable ? "Listed" : "Adopted"}
            </Text>
          </View>
        </View>

        <Text style={styles.petBreed} numberOfLines={1}>
          {pet.breed} • {pet.sex}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.statsContainer}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={14}
              color={Themes.COLORS.textFaded}
            />
            <Text style={styles.statsText}> 24 Views</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={Themes.COLORS.primary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    backgroundColor: Themes.COLORS.card,

    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.sm,

    padding: Themes.SPACING.md,

    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 2,
  },
  petImage: {
    width: 85,
    height: 85,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 18,
    color: Themes.COLORS.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  petBreed: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    color: Themes.COLORS.textFaded,
    marginTop: -2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    fontSize: 12,
    color: Themes.COLORS.textFaded,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
  },
});
