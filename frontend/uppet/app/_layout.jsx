import { Stack } from "expo-router";
import { useEffect } from "react";
import { UserProvider, useUser } from "../context/UserContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
} from "@expo-google-fonts/fredoka";
import * as Themes from "../assets/themes/themes";

// 1. IMPORT NETINFO AND ICONS
import { useNetInfo } from "@react-native-community/netinfo";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// 2. CUTE FLOATING NETWORK BANNER
function NetworkBanner() {
  const { isConnected, isInternetReachable } = useNetInfo();
  const insets = useSafeAreaInsets();

  // Hide the banner if connected or if it's still calculating
  if (isConnected !== false && isInternetReachable !== false) {
    return null;
  }

  return (
    // We add a little extra gap (10px) so it floats nicely below the status bar
    <View style={[styles.offlineBannerWrapper, { top: insets.top + 10 }]}>
      <View style={styles.offlinePill}>
        <MaterialCommunityIcons name="paw" size={18} color="white" />
        <Text style={styles.offlineText}>Paws-ed! No internet connection.</Text>
      </View>
    </View>
  );
}

function NavigationStack() {
  const { token, loading, newUser } = useUser();
  const socket = useSocket();
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
      SplashScreen.preventAutoHideAsync();
      console.log("Loading fonts...");
    }
  }, [fontsLoaded, loading]);

  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: {
          fontFamily: Themes.TYPOGRAPHY.heading?.fontFamily || "Fredoka-Medium",
        },
      }}
    >
      <Stack.Protected guard={token}>
        <Stack.Screen name="(drawer)"></Stack.Screen>
        <Stack.Screen
          name="createPetProfile"
          options={{ headerShown: true, title: "Create Pet Profile" }}
        ></Stack.Screen>
        <Stack.Screen
          name="viewProfile"
          options={{
            headerShown: true,
            title: "Profile",
          }}
        ></Stack.Screen>
        <Stack.Screen
          name="viewApplicantsMyAdoptees"
          options={{ headerShown: true, title: "Applicants" }}
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
        <Stack.Screen
          name="viewMyApplication"
          options={{ headerShown: true, title: "My Application" }}
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
        <SafeAreaProvider>
          {/* 3. DROP THE BANNER RIGHT ABOVE YOUR STACK */}
          <NetworkBanner />
          <NavigationStack></NavigationStack>
        </SafeAreaProvider>
      </SocketProvider>
    </UserProvider>
  );
}

// 4. UPDATED STYLES FOR THE "CUTE" PILL LOOK
const styles = StyleSheet.create({
  offlineBannerWrapper: {
    position: "absolute",
    width: "100%",
    alignItems: "center", // Centers the pill horizontally
    zIndex: 9999,
    elevation: 10,
  },
  offlinePill: {
    backgroundColor: "#FF6B6B", // A softer, pastel-friendly red/coral
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25, // Makes it perfectly round like a pill
    gap: 8, // Space between the paw and text
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  offlineText: {
    color: "white",
    fontFamily: Themes.TYPOGRAPHY?.heading?.fontFamily || "Fredoka-Medium",
    fontSize: 15,
  },
});
