import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// WebBrowser.maybeCompleteAuthSession();
// https://expo.dev/accounts/seafret/projects/uppet/builds/bbc888c4-30ba-4995-ae01-c564006f8b7b

// iosClientId:
//   "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
// androidClientId:
//   "6734110788-dsgk74dm16ddm73bsuce679vcqif92pe.apps.googleusercontent.com",

export default function Login() {
  const navigation = useNavigation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  GoogleSignin.configure({
    webClientId:
      "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com",
    iosClientId:
      "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
  });

  const handleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response) {
        console.log(response.data.user);
        setIsSignedIn(true);
      }

      console.log("Success");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signin OUT");
      await GoogleSignin.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSignedIn(false);
    }
  };

  return (
    <View>
      <Pressable
        style={styles.myprofile}
        onPress={() => navigation.navigate("(drawers)")}
      >
        <Ionicons name="grid-outline" size={50}></Ionicons>
      </Pressable>
      <GoogleSigninButton
        onPress={handleSignIn}
        title="Sign In with Google"
      ></GoogleSigninButton>
      <Pressable
        style={styles.myprofile}
        title="Sign Out"
        onPress={handleSignOut}
        disabled={!isSignedIn}
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
