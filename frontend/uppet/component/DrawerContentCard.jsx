import { View, Text, Image, StyleSheet, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";

export default function ProfileDrawer(props) {
  const [email, setEmail] = useState(" ");
  const { logout } = useUser();
  const router = useNavigation();

  const handleProfileClick = () => {
    console.log("IT HAS BEEN PRESSED");
    router.navigate("viewProfile");
  };

  const handleSignOut = async () => {
    try {
      console.log("Signed OUT");
      logout();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <View style={styles.profileDrawerContainer}>
      <Pressable style={styles.profileContainer} onPress={handleProfileClick}>
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/a/ACg8ocL0iPaGNeyu9wgGzyUvGbyEh-ooGF5FzvbNG9xnUwUd4TuB=s96-c",
          }}
          style={styles.profileImageContainer}
        ></Image>
        <Text>{email}</Text>
      </Pressable>
      <View>
        <Button title="Sign Out" onPress={handleSignOut}></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileDrawerContainer: {
    borderWidth: 2,
    borderColor: "cyan",
    width: "100%",
    padding: 100,
  },
  profileContainer: {
    borderColor: "red",
    borderWidth: 2,
    width: "100%",
    flexDirection: "row",
  },
  profileImageContainer: {
    height: 40,
    width: 40,
  },
});
