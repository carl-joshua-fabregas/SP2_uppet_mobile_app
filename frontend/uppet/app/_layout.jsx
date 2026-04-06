import { Stack } from "expo-router";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
} from "@expo-google-fonts/fredoka";

export default function RootLayout() {
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    "Fredoka-Regular": Fredoka_400Regular,
    "Fredoka-Medium": Fredoka_500Medium,
    "Fredoka-SemiBold": Fredoka_600SemiBold,
  });
  useEffect(() => {
    if (fontsLoaded) {
      console.log("Fonts loaded successfully");
    } else {
      console.log("Loading fonts...");
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

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
      <Stack.Screen
        name="createAdopterProfile"
        options={{ headerShown: true, title: "Profile" }}
      ></Stack.Screen>
      <Stack.Screen
        name="viewApplicantsMyAdoptees"
        options={{ headerShown: true, title: "Profile" }}
      ></Stack.Screen>
      <Stack.Screen
        name="viewAdopterProfile"
        options={{ headerShown: true, title: "Profile" }}
      ></Stack.Screen>
      <Stack.Screen
        name="viewPetProfile"
        options={{ headerShown: true, title: "Pet Profile" }}
      ></Stack.Screen>
    </Stack>
  );
}
