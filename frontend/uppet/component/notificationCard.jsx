import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationCard(props) {
  const { notification } = props;
  const notifTypeIcon = {
    Approved: "checkmark-circle-sharp",
    Cancelled: "alert-circle-sharp",
    Rejected: "close-circle-sharp",
    Pending: "ellipsis-horizontal-circle-sharp",
  };
  return (
    <View style={styles.notificationContainer}>
      <Ionicons
        name={notifTypeIcon[notification.notifType]}
        size={40}
      ></Ionicons>
      <Text>{notification.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    borderWidth: 2,
    borderColor: "blue",
    flexDirection: "row",
    width: "100%",
    padding: 10,
    justifyContent: "space-around",
  },
});
