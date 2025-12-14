import { Stack } from "expo-router";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const navigation = useNavigation();

  console.log("HEHEHE ROOT");
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"></Stack.Screen>
      <Stack.Screen name="(drawer)"></Stack.Screen>
      <Stack.Screen
        name="createPetProfile"
        options={{ headerShown: true, title: "Create Pet Profile" }}
      ></Stack.Screen>
      <Stack.Screen
        name="viewProfile"
        options={{ headerShown: true, title: "Profile" }}
      ></Stack.Screen>
    </Stack>
  );
}
