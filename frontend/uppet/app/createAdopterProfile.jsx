import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRoute } from "@react-navigation/native";
import AdopterProfileInput from "../component/CreateAdopterProfileCard";
export default function createAdopterProfile(props) {
  const router = useRoute();
  const type = router.params.type;

  // const { type } = props.route.params || {}; // safe access
  return (
    <View>
      <AdopterProfileInput cardType={type}></AdopterProfileInput>
    </View>
  );
}
