import { Drawer } from "expo-router/drawer";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileDrawer from "../../component/DrawerContentCard";

export default function Menu() {
  console.log("THEY SEE ME ROLLING");

  return (
    <Drawer
      screenOptions={{
        drawerPosition: "right",
        drawerStyle: {
          width: "60%",
        },
      }}
      drawerContent={ProfileDrawer}
    >
      <Drawer.Screen
        name="(tabs)"
        options={({ navigation }) => ({
          headerTitle: () => (
            <Image
              source={require("../../assets/images/SplashScreen_green.png")}
              style={{ width: 150, height: 150, resizeMode: "contain" }}
            />
          ),
          headerTitleAlign: "left",
          drawerLabel: "Dashboard",

          // This overrides the default hamburger menu on the right
          headerRight: () => (
            <Pressable
              onPress={() => navigation.toggleDrawer()}
              style={{ marginRight: 16 }} // Keeps it from touching the screen edge
            >
              {/* Using the paw icon for UPPET! Swap to "menu" if you want the classic hamburger */}
              <Ionicons
                name="paw"
                size={28}
                color="#2d3748" // A nice dark gray/black, adjust as needed
              />
            </Pressable>
          ),
        })}
      />
    </Drawer>
  );
}
