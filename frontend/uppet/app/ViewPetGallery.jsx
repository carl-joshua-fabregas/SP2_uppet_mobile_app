import { Text, ScrollView, Button, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import { useEffect, useState } from "react";
import { api } from "../api/axios";

export default function ViewPetProfile() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [hasApplied, setHasApplied] = useState(false);

  const getHasApplied = async () => {
    try {
      const res = await api.get(
        `/api/adoptionApp/${params.pet._id}/applied`,
        {},
      );
      setHasApplied(res.data.hasApplied);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getHasApplied();
  }, [hasApplied]);
  const handleViewGallery = () => {
    console.log("HandleViewClicked");
  };
  const handleMessage = () => {
    console.log("HandleMessageClicked");
  };

  const handleApply = () => {
    console.log("HandleApplyClicked");
  };
  return (
    <View>
      <PetProfileCardViewMore pet={params.pet}></PetProfileCardViewMore>
      <Button title="View Gallery" onPress={handleViewGallery}></Button>
      <Button title="Message" onPress={handleMessage}></Button>
      <Button title="Apply" onPress={handleApply}></Button>
    </View>
  );
}
