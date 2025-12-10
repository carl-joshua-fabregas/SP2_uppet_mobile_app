import { Text, View, StyleSheet } from "react-native";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";

export default function Index() {
  const navigation = useNavigation();
  return (
    <View>
      <Pressable
        style={styles.myprofile}
        onPress={() => navigation.navigate("(drawers)")}
      >
        <Ionicons name="grid-outline" size={50}></Ionicons>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  myprofile: {
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    margin: 0,
  },
});
