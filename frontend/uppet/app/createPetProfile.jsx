import { Text, View } from "react-native";
import CreatePetCard from "../component/CreatePetCard";
const api = require("../api/axios");

export default function CreateProfile() {
  return (
    <View>
      <CreatePetCard></CreatePetCard>
    </View>
  );
}
