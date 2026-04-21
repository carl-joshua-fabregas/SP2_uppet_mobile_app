import { View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
export default function ViewAdopterProfile() {
  const router = useRoute();

  const [user, setUser] = useState({});
  console.log("THIS IS ADOPTER PROFILE");
  console.log(router.params.id);
  const getProfile = async () => {
    try {
      const res = await api.get(`/api/user/${router.params.id}`, {});
      const userData = res.data.body;

      setUser(userData);
      console.log("I LOADED");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ProfileCard adopter={user}></ProfileCard>
    </ScrollView>
  );
}
