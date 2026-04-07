import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import * as THEMES from "../../../assets/themes/themes";
import { Pressable } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEMES.COLORS.primary,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: THEMES.TYPOGRAPHY.label.fontSize,
          fontFamily: THEMES.TYPOGRAPHY.label.fontFamily,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            style={({ pressed }) => [
              props.style,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          />
        ),
      }}
    >
      {/*#efb07d */}
      <Tabs.Screen
        name="index"
        options={{
          title: "UPPET",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            ></Ionicons>
          ),
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="myAdoptee"
        options={{
          title: "My Adoptees",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "paw-sharp" : "paw-outline"}
              color={color}
              size={24}
            ></Ionicons>
          ),
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "notifications-sharp" : "notifications-outline"}
              color={color}
              size={24}
            ></Ionicons>
          ),
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="message"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubble-ellipses-sharp"
                  : "chatbubble-ellipses-outline"
              }
              color={color}
              size={24}
            ></Ionicons>
          ),
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}

// tabBarButton: (props) => (
//   <Pressable
//     {...props}
//     style={({ pressed }) => [
//       props.style,
//       { opacity: pressed ? 0.5 : 1 },
//     ]}
//   />
// ),
