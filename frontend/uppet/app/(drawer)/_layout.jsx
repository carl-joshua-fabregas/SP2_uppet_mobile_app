import { Drawer } from "expo-router/drawer";
import ProfileDrawer from "../../component/DrawerContentCard";
export default function Menu() {
  console.log("THEY SEE ME ROLLING");
  c;
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
          title: "UPPET",
          drawerLabel: "Name",
        }}
      ></Drawer.Screen>
    </Drawer>
  );
}
