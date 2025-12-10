import { Drawer } from "expo-router/drawer";

export default function Menu() {
  return (
    <Drawer screenOptions={{ drawerPosition: "right" }}>
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
