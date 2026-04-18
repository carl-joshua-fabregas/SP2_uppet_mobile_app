import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import ProfileCard from "../component/AdopterProfileCard";
export default function AdopterProfile() {
  const { user } = useUser();
  const navigation = useNavigation();

  const handleEditing = () => {
    navigation.navigate("createAdopterProfile");
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ProfileCard
        adopter={user}
        isOwner={true}
        handleEditing={handleEditing}
      ></ProfileCard>
    </ScrollView>
  );
}
