import { ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import ProfileCard from "../component/AdopterProfileCard";
const api = require("../api/axios");
export default function AdopterProfile() {
  const [user, setUser] = useState({});
  const navigation = useNavigation();
  const getProfile = async () => {
    try {
      const res = await api.get("/api/user/me", {});
      const userData = res.data.body;

      setUser(userData);
      console.log("I LOADED");
    } catch (err) {
      console.log(err);
    }
  };

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
