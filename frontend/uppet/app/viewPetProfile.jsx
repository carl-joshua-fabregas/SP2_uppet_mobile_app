import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import PetProfileCardViewMore from "../component/PetProfileCard";
import { useEffect, useState } from "react";
import * as Themes from "../assets/themes/themes";
import { api } from "../api/axios";
import { useUser } from "../context/UserContext";
export default function ViewPetProfile() {
  const { user } = useUser();
  const route = useRoute();
  const navigation = useNavigation();
  const [status, setStatus] = useState(false);
  const [isOwner, setIsOwner] = useState(
    route?.params?.pet?.ownerId === user._id,
  );
  const [adoptionApp, setAdoptionApp] = useState({});
  const [loading, setLoading] = useState(false);
  const pet = route.params.pet;
  console.log("View Profile The pet data transferred is", pet);
  console.log("IS Owner? ", isOwner, route?.params?.pet?.ownerId, user._id);

  const getstatus = async () => {
    try {
      const res = await api.get(`/api/adoptionApp/${pet._id}/applied`, {});
      console.log("This is the adoption App", res.data);
      if (res.data.body) {
        setStatus(res.data.body.status);
        setAdoptionApp(res.data.body);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (pet._id) {
      getstatus();
    }
  }, [pet._id]);

  //   const handleViewGallery = () => {
  //     console.log("HandleViewClicked");
  //   };
  //       <Button title="View Gallery" onPress={handleViewGallery}></Button>

  const handleMessage = async () => {
    console.log("HandleMessageClicked: ", pet.ownerId);
    try {
      const res = await api.get(`/api/chatlist/get/${pet.ownerId}`);
      const chatThreadOrigin = res.data.body;
      if (!chatThreadOrigin)
        console.log("No Chat Thread Origin Yet, sending: ", chatThreadOrigin);

      navigation.navigate("messageScreen", {
        receiverID: pet.ownerId,
        chatThreadOrigin: chatThreadOrigin,
      });
    } catch (err) {
      console.log("ERROR in handling Message", err.message);
    }
  };
  const handleViewOwnerProfile = () => {
    console.log("View Owner Profile Clicked");
    navigation.navigate("viewAdopterProfile", {
      id: pet.ownerId,
    });
  };
  const handleApply = async () => {
    await api.post(`/api/adoptionApp/applied`, {
      petToAdopt: pet._id,
    });
    setStatus("Pending");
    console.log("HandleApplyClicked");
  };

  const handleCancel = async () => {
    await api.delete(`/api/adoptionApp/${pet._id}/cancelled`, {});
    setStatus("Cancelled");
    console.log("HandleCancelClicked");
  };

  const handleViewApplicants = () => {
    console.log("handleViewApplicantsClicked");
    navigation.navigate("viewApplicantsMyAdoptees", {
      petID: pet._id,
    });
  };

  const handleEditPetProfile = () => {
    navigation.navigate("createPetProfile", { editPetData: pet });
  };

  const handleDeletPetProfile = async () => {
    console.log("Handle Delete Profile Clicked");
    try {
      setLoading(true);
      const deletePhotos = await Promise.all(
        pet.photos.map(async (photo) => {
          console.log("Deleting Photo with ID: ", photo._id);

          const presignDeleteUrl = await api.post(`/api/pet/presignDeleteURL`, {
            key: photo.key,
          });
          console.log(
            "Presign URL for Deleting Photo: ",
            presignDeleteUrl.data,
          );

          const { url, key } = presignDeleteUrl.data.body;

          const awsDelete = await fetch(url, {
            method: "DELETE",
          });
          console.log("Status of aws deletion", awsDelete.status);
        }),
      );
      const res = await api.delete(`/api/pet/${pet._id}`, {});
      console.log("Pet deleted successfully", res.status);
    } catch (err) {
      console.log("Error in deleting Pet");
      console.log(err);
    } finally {
      setLoading(false);
      navigation.goBack();
    }
  };

  const buttons = [];
  if (isOwner) {
    buttons.push({
      title: "View Applicants",
      onPress: handleViewApplicants,
      styleType: "calm",
    });
    buttons.push({
      title: "Edit Pet Profile",
      onPress: handleEditPetProfile,
      styleType: "neutral",
    });
    buttons.push({
      title: "Delete Pet Profile",
      onPress: handleDeletPetProfile,
      styleType: "warning",
    });
  } else {
    buttons.push({
      title: "View Owner Profile",
      onPress: handleViewOwnerProfile,
      styleType: "calm",
    });
    buttons.push({
      title: "Message Owner",
      onPress: handleMessage,
      styleType: "neutral",
    });

    const isApplicant = adoptionApp && adoptionApp.applicant === user._id;

    if (isApplicant) {
      if (adoptionApp.status === "Approved") {
        buttons.push({
          title: "Approved", // Changed to past tense for clarity
          disabled: true,
          styleType: "disabled",
        });
      } else if (adoptionApp.status === "Pending") {
        buttons.push({
          title: "Cancel Application",
          onPress: handleCancel,
          styleType: "warning",
        });
      } else if (adoptionApp.status === "Rejected") {
        buttons.push({
          title: "Apply Again",
          onPress: handleApply,
          styleType: "calm",
        });
      }
    } else {
      // User HAS NOT applied yet
      buttons.push({
        title: "Apply",
        onPress: handleApply,
        styleType: "calm",
      });
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <PetProfileCardViewMore pet={route.params.pet} />

      {/* FIX: Actually rendering the buttons to the screen */}
      <View style={styles.buttonSection}>
        {buttons.map((btn, index) => {
          // Assign styles dynamically based on the styleType defined above
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
    paddingBottom: Themes.SPACING?.xl || 32, // Padding at the bottom so the last button isn't cut off
    backgroundColor: Themes.COLORS.background,
  },
  buttonSection: {
    marginTop: Themes.SPACING?.lg || 16,
    paddingHorizontal: Themes.SPACING?.md || 16, // Added horizontal padding so buttons don't touch screen edges
    gap: Themes.SPACING?.md || 12,
    width: "100%",
  },
  calmButtonContainer: {
    backgroundColor: Themes.COLORS.primary, // Your original Green color
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

  // DESTRUCTIVE ACTION (Cancel / Delete) - Clear, but not overwhelming
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
});
