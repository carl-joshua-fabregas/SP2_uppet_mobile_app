import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Button,
  Dimensions,
} from "react-native";
const width = Dimensions.get("window").width;

export default function PetCard(props) {
  //   console.log(props);
  const { pet } = props;
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
          <Text>Name: {pet.name}</Text>
          <Text>Age: {pet.age}</Text>
          <Text>Breed: {pet.breed}</Text>
        </View>
      </View>
      <View style={styles.mainImage}>
        <Image
          source={require("../assets/images/doggoe.jpg")}
          style={styles.mainImageContent}
          resizeMode="cover"
        ></Image>
      </View>
      <View>
        <View style={styles.buttonContainer}>
          <Button title="VIEW MORE"></Button>
        </View>
      </View>
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
