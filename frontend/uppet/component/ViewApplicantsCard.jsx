import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
const width = Dimensions.get("window").width;

export default function ViewApplicantsCard(props) {
  const router = useRoute();
  const navigator = useNavigation();
  const { adoptionApp } = props;
  console.log("VIEW APPLICATION CARD THE DATA IS", adoptionApp);
  const applicant = adoptionApp.applicant;

  const onViewApplicantPress = () => {
    console.log("View Applicant is pressed ", applicant);
    navigator.navigate("viewAdopterProfile", { id: applicant._id });
  };
  const onAcceptPress = () => {
    console.log("Accepted is pressed");
  };
  const onRejectPress = () => {
    console.log("Reject is pressed");
  };
  const onMessagePress = () => {
    console.log("Message is pressed");
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.TopDetailsContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require("../assets/images/doggoe.jpg")}
            style={styles.profileImageStyle}
            resizeMode="cover"
          ></Image>
        </View>
        <View style={styles.detailsContainer}>
          <Text>Name: {applicant.firstName}</Text>
          <Text>Address: {applicant.address}</Text>
        </View>
      </View>
      <Button title="View Applicants" onPress={onViewApplicantPress}></Button>
      <Button title="Message" onPress={onMessagePress}></Button>
      <Button title="Accept" onPress={onAcceptPress}></Button>
      <Button title="Decline" onPress={onRejectPress}></Button>
    </View>
  );
}
const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 2,
    borderColor: "violet",
    // justifyContent: "center",
    // alignItems: "center",
    // flexDirection: "column",
    width: "100%",
    overflow: "hidden",
    marginVertical: 2,
    marginHorizontal: 0,
  },
  TopDetailsContainer: {
    borderWidth: 2,
    borderColor: "green",
    flexDirection: "row",
    padding: 2,
  },
  detailsContainer: {
    flex: 0.8,
    borderWidth: 2,
    borderColor: "red",
    alignContent: "center",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  profileImageContainer: {
    flex: 0.2,
    borderWidth: 2,
    borderColor: "yellow",
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImageStyle: {
    borderRadius: (width * 0.175) / 2,
    width: width * 0.175,
    height: width * 0.175,

    // overflow: "hidden",
    // width: "100%",
    // aspectRatio: 1,
  },
  mainImage: {
    width: "100%",
    borderWidth: 2,
    borderColor: "cyan",
    backgroundColor: "#efb07d",
    alignItems: "center",
    justifyContent: "center",
  },
  mainImageContent: {
    aspectRatio: 16 / 9,
  },

  buttonContainer: {
    borderWidth: 2,
    borderColor: "blue",
    width: "100%",
  },
});
