import { Drawer } from "expo-router/drawer";
import { Image } from "expo-image";
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
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/images/SplashScreen_green.png")} // 3. Put your actual logo file name here!
              style={{ width: 150, height: 150, resizeMode: "contain" }}
            />
          ),
          headerTitleAlign: "left",
          drawerLabel: "Dashboard",
        }}
      ></Drawer.Screen>
    </Drawer>
  );
}
