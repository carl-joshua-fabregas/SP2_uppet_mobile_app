import { View, Text, Image, StyleSheet, Button } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";

export default function ProfileDrawer(props) {
  const [email, setEmail] = useState(" ");
  const router = useNavigation();

  const getEmail = async () => {
    try {
      const storeEmail = await AsyncStorage.getItem("email");
      setEmail(storeEmail);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getEmail();
  }, []);

  const handleSignOut = async () => {
    try {
      console.log("Signed OUT");
      await GoogleSignin.signOut();
      router.replace("index");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <View style={styles.profileDrawerContainer}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: "https://lh3.googleusercontent.com/a/ACg8ocL0iPaGNeyu9wgGzyUvGbyEh-ooGF5FzvbNG9xnUwUd4TuB=s96-c",
          }}
          style={styles.profileImageContainer}
        ></Image>
        <Text>{email}</Text>
      </View>
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
