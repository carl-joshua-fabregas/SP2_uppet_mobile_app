import { Text, View, StyleSheet } from "react-native";
import { Pressable, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const navigation = useNavigation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      "6734110788-rn5ibmvbnn7tf00hmr0lihi6ph9ma1fs.apps.googleusercontent.com",
    iosClientId:
      "6734110788-9lbc61k9u8dg4tebk8uppo4ve75ju28b.apps.googleusercontent.com",
    androidClientId:
      "6734110788-dsgk74dm16ddm73bsuce679vcqif92pe.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      console.log(response.authentication);
    }
  }, [response]);

  return (
    <View>
      <Pressable
        style={styles.myprofile}
        onPress={() => navigation.navigate("(drawers)")}
      >
        <Ionicons name="grid-outline" size={50}></Ionicons>
      </Pressable>
      <Button
        disabled={!request}
        onPress={() => promptAsync()}
        title="Sign in with Google!"
      ></Button>
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
