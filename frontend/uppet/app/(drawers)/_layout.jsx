import { Drawer } from "expo-router/drawer";

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
