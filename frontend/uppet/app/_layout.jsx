import { Stack } from "expo-router";
import { useEffect } from "react";
import { UserProvider, useUser } from "../context/UserContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
// import { ChatProvider, useChats } from "../context/ChatContext";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
} from "@expo-google-fonts/fredoka";

function NavigationStack() {
  const { token, loading, newUser } = useUser();
  const [fontsLoaded] = useFonts({
    "Fredoka-Regular": Fredoka_400Regular,
    "Fredoka-Medium": Fredoka_500Medium,
    "Fredoka-SemiBold": Fredoka_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
      console.log("Fonts loaded successfully");
    } else {
      console.log("Loading fonts...");
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded) {
    return null; // or a loading spinner
  }

  if (loading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={token}>
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
        <Stack.Screen
          name="messageScreen"
          options={{ headerShown: true, title: "Messages" }}
        ></Stack.Screen>
      </Stack.Protected>
      <Stack.Protected guard={!token && !newUser}>
        <Stack.Screen name="index"></Stack.Screen>
      </Stack.Protected>
      <Stack.Screen
        name="createAdopterProfile"
        options={{ headerShown: true, title: "Profile" }}
      ></Stack.Screen>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <SocketProvider>
        {/* <ChatProvider> */}
        <NavigationStack></NavigationStack>
        {/* </ChatProvider> */}
      </SocketProvider>
    </UserProvider>
  );
}
