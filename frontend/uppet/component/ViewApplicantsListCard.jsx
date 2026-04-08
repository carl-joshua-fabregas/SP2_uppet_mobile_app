import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as Themes from "../assets/themes/themes";
const width = Dimensions.get("window").width;

export default function ViewApplicantsCard({
  adoptionApp,
  handleAccept,
  handleReject,
}) {
  const navigator = useNavigation();
  console.log("This is the adoption app in the card", adoptionApp);
  const applicant = adoptionApp.applicant;

  const onViewApplicantPress = () => {
    console.log("View Applicant is pressed ", applicant);
    navigator.navigate("viewAdopterProfile", { id: applicant._id });
  };
  const onMessagePress = () => {
    console.log("Message is pressed");
  };

  const Badge = ({ status }) => {
    let badgeStyle, textStyle;
    switch (status) {
      case "Pending":
        badgeStyle = styles.badgePending;
        textStyle = styles.badgeTextPending;
        break;
      case "Approved":
        badgeStyle = styles.badgeApproved;
        textStyle = styles.badgeTextApproved;
        break;
      case "Rejected":
        badgeStyle = styles.badgeRejected;
        textStyle = styles.badgeTextRejected;
        break;
      default:
        badgeStyle = styles.badgePending;
        textStyle = styles.badgeTextPending;
    }
    return (
      <View style={[styles.badgeContainer, badgeStyle]}>
        <Text style={[styles.badgeText, textStyle]}>{status}</Text>
      </View>
    );
  };
  return (
    <TouchableOpacity
      style={styles.adopterCardContainer}
      onPress={onViewApplicantPress}
    >
      <View style={styles.adopterCardRow}>
        <Image
          source={require("../assets/images/doggoe.jpg")}
          style={styles.profileImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.applicantName}>
            {applicant.firstName}{" "}
            {applicant.middleName ? applicant.middleName + " " : ""}
            {applicant.lastName}
          </Text>
          <Text style={styles.detailsText} numberOfLines={1}>
            📍{applicant.address}
          </Text>
          <Text style={styles.detailsText} numberOfLines={1}>
            Date Applied:{" "}
            {adoptionApp.timeStamp
              ? new Date(adoptionApp.timeStamp).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
        <View style={styles.badgeContainer}>
          <Badge status={adoptionApp.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  listContents: {
    paddingHorizontal: Themes.SPACING.md,
    paddingBottom: Themes.SPACING.lg,
  },
  adopterCardContainer: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginTop: Themes.SPACING.sm, // Vertical space between cards
    // Subtle shadow (Fredoka friendly)
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  adopterCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  applicantName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.TYPOGRAPHY.heading.color,
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Themes.RADIUS.pill,
    minWidth: 70,
    alignItems: "center",
  },
  badgePending: {
    backgroundColor: "#FFF4E0",
  },
  badgeApproved: {
    backgroundColor: Themes.COLORS.badge,
  },
  badgeRejected: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextPending: {
    color: "#D97706",
  },
  badgeTextApproved: {
    color: Themes.COLORS.badgeText,
  },
  badgeTextRejected: {
    color: "#991B1B",
  },
  badgeText: {
    fontFamily: Themes.TYPOGRAPHY.badgeText.fontFamily,
    fontSize: Themes.TYPOGRAPHY.badgeText.fontSize,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Themes.COLORS.badge, // Placeholder background
    overflow: "hidden",
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: Themes.SPACING.md,
  },
  detailsText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textDark,
    marginTop: Themes.SPACING.xs,
  },
});

//  <View style={styles.cardContainer}>
//       <View style={styles.TopDetailsContainer}>
//         <View style={styles.profileImageContainer}>
//           <Image
//             source={require("../assets/images/doggoe.jpg")}
//             style={styles.profileImageStyle}
//             resizeMode="cover"
//           ></Image>
//         </View>
//         <View style={styles.detailsContainer}>
//           <Text>Name: {applicant.firstName}</Text>
//           <Text>Address: {applicant.address}</Text>
//         </View>
//       </View>
//       <TouchableOpacity onPress={onViewApplicantPress}>
//         <Text>View Applicants</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={onMessagePress}>
//         <Text>Message</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         onPress={handleAccept}
//         disabled={!isPending}
//         style={[{ backgroundColor: acceptColor }]}
//       >
//         <Text>{isApproved ? "Approved" : "Accept"}</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         onPress={handleReject}
//         disabled={!isPending}
//         style={[{ backgroundColor: declineColor }]}
//       >
//         <Text>{isRejected ? "Rejected" : "Decline"} </Text>
//       </TouchableOpacity>
//     </View>
