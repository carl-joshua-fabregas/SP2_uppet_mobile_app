import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRoute } from "@react-navigation/native";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes";
import CreateRatingModal from "../component/createRatingModal";
import { useUser } from "../context/UserContext";
export default function ViewAdopterProfile() {
  const router = useRoute();

  const [adopter, setAdopter] = useState({});
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  console.log("THIS IS ADOPTER PROFILE");
  console.log(router.params.id);
  
  const handleRatingButtonClick = () => {
    setRatingModalVisible(true)
    console.log("Write a review clicked");
  }
  const handleRatingPost = async (score, body) => {
    if(uploading) return;
      setUploading(true)
    try {
      const res = await api.post(`/api/rating/${adopter._id}`, {
      score: score, 
      body: body,
      ratedUser: adopter._id,
    })
    if(res.data.body){
      console.log("success in rating")
    }
    } catch (err) {
      console.log(err);
    } finally{
      setUploading(false);
    }
  }
  
  const handleAccept = () => {
    console.log("Accept applicant clicked");
  }

  const handleReject = () => {
    console.log("Reject applicant clicked");
  }

  const handleMessage = () => {
    console.log("Message applicant clicked");
  }

  const getProfile = async () => {
    try {
      const res = await api.get(`/api/user/${router.params.id}`, {});
      const userData = res.data.body;

      setAdopter(userData);
      console.log("I LOADED");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const buttons = [
    {
      title: "Write a Review",
      onPress: handleRatingButtonClick,
      styleType: "neutral",
    },
    {
      title: "Accept Application",
      onPress: handleAccept,
      styleType: "calm",
    },
    {
      title: "Reject Application",
      onPress: handleReject,
      styleType: "warning",
    },
    {
      title: "Message Applicant",
      onPress: handleMessage,
      styleType: "neutral",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ProfileCard adopter={adopter} />
      <CreateRatingModal visible={ratingModalVisible} setRatingModalVisible={setRatingModalVisible} handleRatingPost={handleRatingPost} onClose={() => setRatingModalVisible(false)} ratedAdopter = {adopter} uploading={uploading}></CreateRatingModal>
      <View style={styles.buttonSection}>
        {buttons.map((btn, index) => {
          const containerStyle =
            btn.styleType === "warning"
              ? styles.warningButtonContainer
              : btn.styleType === "neutral"
                ? styles.neutralButtonContainer
                : styles.calmButtonContainer;

          const textStyle =
            btn.styleType === "warning"
              ? styles.warningButtonText
              : btn.styleType === "neutral"
                ? styles.neutralButtonText
                : styles.calmButtonText;

          return (
            <TouchableOpacity
              key={index}
              style={containerStyle}
              onPress={btn.onPress}
            >
              <Text style={textStyle}>{btn.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32,
    backgroundColor: Themes.COLORS.background,
  },
  buttonSection: {
    marginTop: Themes.SPACING?.lg || 16,
    paddingHorizontal: Themes.SPACING?.md || 16,
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  calmButtonContainer: {
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calmButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
  neutralButtonContainer: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  neutralButtonText: {
    color: "#686262",
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
  warningButtonContainer: {
    backgroundColor: "#f37270",
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButtonText: {
    color: "#fff",
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
});
