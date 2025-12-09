import { Text, View, StyleSheet, Image } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../../assets/images/doggoe.jpg")}
          style={styles.image}
        ></Image>
      </View>

      <View>
        <Text>Name: CJ</Text>
        <Text>Age: Carley</Text>
        <Text>Joshua</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
});
