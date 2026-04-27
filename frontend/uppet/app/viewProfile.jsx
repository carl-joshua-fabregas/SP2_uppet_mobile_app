import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import ProfileCard from "../component/AdopterProfileCard";
import { api } from "../api/axios";
import * as Themes from "../assets/themes/themes.js";
export default function AdopterProfile() {
  const { user, logout } = useUser();
  const navigation = useNavigation();

  const handleEditing = () => {
    navigation.navigate("createAdopterProfile");
  };

  const handleSignOut = () => {
    logout();
  };

  const handleDeleteProfile = async () => {
    try {
      const presignURL = await api.post(`/api/user/presignDeleteURL`, {
        key: user.profilePhoto.key,
      });

      const { url, key } = presignURL.data.body;

      const awsDelRes = await fetch(url, {
        method: "DELETE",
      });

      console.log("DID WE DELETE THE PROFILE", awsDelRes.ok);

      const deleteProfileRes = await api.delete(`/api/user/delete`);
      console.log(
        "Did we succeed?",
        deleteProfileRes.status,
        deleteProfileRes.data.message,
      );
    } catch (err) {
      console.log("Error in deleting Profile", err.message);
    } finally {
      logout();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ProfileCard
        adopter={user}
        isOwner={true}
        handleEditing={handleEditing}
      ></ProfileCard>
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.neutralButtonContainer}
          onPress={handleSignOut}
        >
          <Text style={styles.neutralButtonText}> Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.warningButtonContainer}
          onPress={handleDeleteProfile}
        >
          <Text style={styles.warningButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  buttonSection: {
    marginTop: Themes.SPACING?.lg || 16,
    paddingHorizontal: Themes.SPACING?.md || 16, // Added horizontal padding so buttons don't touch screen edges
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Themes.SPACING?.xl || 32, // Padding at the bottom so the last button isn't cut off
    backgroundColor: Themes.COLORS.background,
  },
  warningButtonContainer: {
    // backgroundColor: "transparent", // Removing the solid red block
    backgroundColor: "#f37270",
    // borderWidth: 1,
    // borderColor: "#EF5350", // Red outline
    minHeight: 48,
    paddingVertical: Themes.SPACING?.md || 12,
    borderRadius: Themes.RADIUS?.md || 8,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButtonText: {
    // color: "#EF5350", // Red text alerts the user without shouting
    color: "#fff",

    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
  neutralButtonContainer: {
    backgroundColor: "#F5F5F5", // A soft gray instead of bright blue
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
    // Removed elevation so it sits flat behind the primary button
  },
  neutralButtonText: {
    color: "#686262", // Dark gray text for readability
    fontSize: Themes.TYPOGRAPHY?.subheading?.fontSize || 16,
    fontFamily: Themes.TYPOGRAPHY?.subheading?.fontFamily,
    fontWeight: "600",
    textAlign: "center",
  },
});
