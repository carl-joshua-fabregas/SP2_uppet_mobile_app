import { Stack } from "expo-router";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const navigation = useNavigation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login"></Stack.Screen>
    </Stack>
  );
}
