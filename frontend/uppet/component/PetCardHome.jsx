import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";

const width = Dimensions.get("window").width;

export default function PetCardHome({ pet, onPress }) {
  const photo = pet.photos.find((photo) => photo.isProfile === 1);
  return (
    <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
      <Image
        source={
          photo ? { uri: photo.url } : require("../assets/images/doggoe.jpg")
        }
        style={styles.imageStyle}
      ></Image>

      <View style={styles.petDetailsContainer}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>
          {pet.breed} • {pet.sex}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{pet.age} years old</Text>
          </View>
        </View>
        <Text style={[styles.petBio, { numberOfLines: 1 }]}>{pet.bio}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.md,
    width: width * 0.9,
    alignSelf: "center",
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: "hidden",
  },
  imageStyle: {
    resizeMode: "cover",
    width: "100%",
    height: 220,
  },
  petDetailsContainer: {
    padding: Themes.SPACING.md,
  },
  petName: {
    fontSize: Themes.TYPOGRAPHY.heading.fontSize,
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    color: Themes.TYPOGRAPHY.heading.color,
    marginBottom: Themes.SPACING.xs,
  },
  petBio: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.TYPOGRAPHY.body.color,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: Themes.SPACING.sm,
    marginTop: Themes.SPACING.xs,
    gap: Themes.SPACING.sm,
    flexWrap: "wrap",
  },
  badgeText: {
    fontSize: Themes.TYPOGRAPHY.badgeText.fontSize,
    fontFamily: Themes.TYPOGRAPHY.badgeText.fontFamily,
    color: Themes.TYPOGRAPHY.badgeText.color,
  },
  badgeContainer: {
    backgroundColor: Themes.COLORS.badge,
    borderColor: Themes.COLORS.soft,
    borderWidth: 1,
    borderRadius: Themes.RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  petBreed: {
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    fontFamily: Themes.TYPOGRAPHY.subsubheading.fontFamily,
    color: Themes.TYPOGRAPHY.subsubheading.color,
  },
});

// <View style={styles.cardContainer}>
//       <View style={styles.TopDetailsContainer}>
//         <View style={styles.profileImageContainer}>
//           <Image
//             source={
//               photo
//                 ? { uri: photo.url }
//                 : require("../assets/images/doggoe.jpg")
//             }
//             style={styles.profileImageStyle}
//             resizeMode="cover"
//             onError={(e) => console.log("Image error", e.nativeEvent.error)}
//           ></Image>
//         </View>
//         <View style={styles.detailsContainer}>
//           <Text>Name: {pet.name}</Text>
//           <Text>Age: {pet.age}</Text>
//           <Text>Breed: {pet.breed}</Text>
//         </View>
//       </View>
//       <View style={styles.mainImage}>
//         <Image
//           source={
//             photo ? { uri: photo.url } : require("../assets/images/doggoe.jpg")
//           }
//           style={styles.mainImageContent}
//           onError={(e) => console.log("Image error", e.nativeEvent.error)}
//           resizeMode="cover"
//         ></Image>
//       </View>
//       <View>
//         <View style={styles.buttonContainer}>
//           <Button title="VIEW MORE" onPress={handleViewMore}></Button>
//         </View>
//       </View>
//     </View>

// console.log("photos:", pet.photos); // 👈 add this
// console.log(
//   "profile photo:",
//   pet.photos.find((photo) => photo.isProfile),
// ); // 👈 and this
