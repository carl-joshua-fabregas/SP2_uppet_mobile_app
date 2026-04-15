import { ScrollView, View } from "react-native";
import { useState, useEffect } from "react";
import ProfileCard from "../component/AdopterProfileCard";
const api = require("../api/axios");
export default function AdopterProfile() {
  const [user, setUser] = useState({});

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

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <ProfileCard adopter={user} isOwner={true}></ProfileCard>
    </ScrollView>
  );
}
