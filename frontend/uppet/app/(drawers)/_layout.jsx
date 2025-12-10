import { Drawer } from "expo-router/drawer";

export default function Menu() {
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
