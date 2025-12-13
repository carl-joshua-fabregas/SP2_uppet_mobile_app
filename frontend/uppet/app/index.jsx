import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Platform,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = require("../api/axios");

// WebBrowser.maybeCompleteAuthSession();
// https://expo.dev/accounts/seafret/projects/uppet/builds/bbc888c4-30ba-4995-ae01-c564006f8b7b

// iosClientId:
//   "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
// androidClientId:
//   "6734110788-dsgk74dm16ddm73bsuce679vcqif92pe.apps.googleusercontent.com",

export default function Login() {
  const router = useNavigation();
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
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices();
      }
      const resGoogle = await GoogleSignin.signIn();
      if (resGoogle) {
        console.log(resGoogle.data);
        setIsSignedIn(true);
        const { idToken } = resGoogle.data;
        const { email } = resGoogle.data.user;

        const res = await api.post("/api/auth/google", {
          token: {
            idToken: idToken,
          },
        });

        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("email", JSON.stringify(email));
        router.replace("(drawers)");
      }

      console.log("Success");
    } catch (err) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("CANCELLED");
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("PLAY SERVICE UNAVAILALE");
      } else {
        console.error(err);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signed OUT");
      await GoogleSignin.signOut();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSignedIn(false);
    }
  };
  const CrossSignInButton = () => {
    if (Platform.OS === "web") {
      return (
        <Button title="Sign In With Google" onPress={handleSignIn}></Button>
      );
    } else {
      return (
        <GoogleSigninButton
          onPress={handleSignIn}
          title="Sign In with Google"
        ></GoogleSigninButton>
      );
    }
  };
  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/react-logo.png")}></Image>
      </View>
      <View style={styles.googleContainer}>
        <CrossSignInButton></CrossSignInButton>
      </View>
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
  logoContainer: {
    display: "flex",
    alignContent: "center",
    justifyContent: "space-around",
    alignItems: "center",
    margin: 2,
    padding: 10,
    height: "100%",
    width: "100%",
    borderColor: "blue",
    borderWidth: 2,
    flex: 1,
  },
  fullScreenContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderColor: "red",
    borderWidth: 2,
    backgroundColor: "#efb07d",
  },
  googleContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    borderWidth: 2,
    borderColor: "yellow",
    alignItems: "center",
    display: "flex",
    justifyContent: "Center",
  },
});
