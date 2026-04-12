import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
// import PCProgressBar from "../component/PetCreationSteps/PCProgressBar";
import PCProgressTracker from "../component/PetCreationSteps/PCProgressTracker";
import PCStep1Component from "../component/PetCreationSteps/steps/PCStep1Component";
import PCStep2Component from "../component/PetCreationSteps/steps/PCStep2Component";
import PCStep3Component from "../component/PetCreationSteps/steps/PCStep3Component";
import PCStep4Component from "../component/PetCreationSteps/steps/PCStep4Component";
import PCStep5Component from "../component/PetCreationSteps/steps/PCStep5Component";
import * as Themes from "../assets/themes/themes";

const api = require("../api/axios");

import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
export default function CreateProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pets, setPets] = useState({
    name: "",
    age: "",
    bio: "",
    sex: "",
    species: "",
    breed: "",
    size: "",
    weight: "",
    vaccination: "",
    sn: "",
    healthCond: "",
    behavior: "",
    specialNeeds: "",
    otherInfo: "",
    photos: [],
  });
  const STEPS = [
    { label: "Basic Info" },
    { label: "Health & Behavior" },
    { label: "Gallery Photos" },
    { label: "Review" },
    { label: "PET PROFILE CARD CREATED" },
  ];

  const handleNext = () => {
    console.log("HANDLE NEXT CALLED. CURRENT STEP:", currentStep);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
    console.log(`update ${currentStep} `, pets);
  };
  const handleBack = () => {
    console.log("HANDLE Back CALLED. CURRENT STEP:", currentStep);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const createPet = async () => {
    console.log("IM DONE");
    try {
      setUploading(false);
      const petCreationRes = await api.post(`api/pet/post`, {
        ...pets,
        photos: [],
      });
      const petCreated = petCreationRes.data;
      const petID = petCreated.body._id;
      console.log("PET CREATED PETID", petCreated, petID);

      const uploadedPhotos = await Promise.all(
        pets.photos.map(async (photo) => {
          console.log(photo);
          const preSignRes = await api.post(`api/pet/presignUploadURL`, {
            fileName: photo.name,
            petId: petID,
            fileType: photo.type,
          });

          const { url, key } = preSignRes.data.body;
          const fetchImage = await fetch(photo.url);
          const blob = await fetchImage.blob();

          await fetch(url, {
            method: "PUT",
            body: blob,
            contentType: photo.type,
          });

          return {
            key: key,
            caption: photo.caption,
            isProfile: photo.isProfile,
            timeStamp: Date.now(),
          };
        }),
      );
      console.log("DONE NA SANA");
      console.log(uploadedPhotos);
      await api.patch(`api/pet/${petID}/photo`, {
        photos: uploadedPhotos,
      });
      setUploading(true);
      return true;
    } catch (err) {
      console.error(err);
    } finally {
      console.log("OKAY NA NA UPLOAD NA TEH");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PCStep1Component
            petData={pets}
            setPetData={setPets}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 1:
        return (
          <PCStep2Component
            petData={pets}
            setPetData={setPets}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PCStep3Component
            petData={pets}
            setPetData={setPets}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <PCStep4Component
            petData={pets}
            onNext={handleNext}
            onBack={handleBack}
            onCreate={createPet}
            uploading={uploading}
          ></PCStep4Component>
        );
      case 4:
        return <PCStep5Component petData={pets}></PCStep5Component>;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.createProfileContainer}>
        <PCProgressTracker currentStep={currentStep} STEPS={STEPS} />
        <View style={styles.headerContainer}>
          <Text style={styles.stepHeaderCount}>
            Step{currentStep + 1} of {STEPS.length}
          </Text>
          <Text style={styles.stepHeaderTitle}>
            {" "}
            {STEPS[currentStep].label}
          </Text>
        </View>
        {renderStep()}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  createProfileContainer: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  stepHeaderCount: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textFaded,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stepHeaderTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 24,
    color: Themes.COLORS.primary, // Forest Green
    marginTop: 4,
  },
});

// const handleImageRead = (petId, caption) => {
//   console.log("HANDLE IMAGE READ CALLED WITH PET ID:", petId);
//   launchImageLibrary(
//     {
//       mediaType: "photo",
//       quality: 1,
//       selectionLimit: 0,
//     },
//     async (response) => {
//       if (response.didCancel) {
//         console.log("GOOD THING I LIKE MY FRIENDS CANCELLED");
//       } else if (response.errorCode) {
//         console.log("ERROR IN IMAGE PICKING", response.errorCode);
//       } else {
//         const newPhotos = response.assets.map((asset) => ({
//           uri: asset.uri,
//           name: asset.fileName,
//           type: asset.type,
//         }));
//         console.log("Pet ID IN HANDLE IMAGE READ", petId);
//         try {
//           await Promise.all(
//             newPhotos.map(async (photo) => {
//               const presignResponse = await api.post(
//                 "api/pet/presignUploadURL",
//                 {
//                   fileName: photo.name,
//                   fileType: photo.type,
//                   petId: petId,
//                   // uri: photo.uri,
//                   // name: photo.name,
//                 },
//               );
//               const { url, key } = presignResponse.data.body;
//               const fetchImage = await fetch(photo.uri);
//               console.log("FETCHED IMAGE FOR UPLOAD:", fetchImage);
//               const blob = await fetchImage.blob();
//               console.log("blob", blob);

//               // await api.put(url, blob,
//               //   { headers: { "Content-Type": photo.type } }
//               // );
//               await fetch(url, {
//                 method: "PUT",
//                 body: blob,
//                 contentType: photo.type,
//               });
//               // "x-amz-meta-uri": photo.uri, "x-amz-meta-name": photo.name
//               console.log("UPLOADED PHOTO TO S3 WITH KEY:", key);
//               console.log("NOW NOTIFYING BACKEND ABOUT THE UPLOADED PHOTO");

//               await api.post(`api/pet/${petId}/photo`, {
//                 key: key,
//                 caption: caption,
//                 isProfile: 1,
//               });
//               console.log("UPLOAD SUCCESSFUL FOR PHOTO WITH KEY:", key);
//             }),
//           );
//           setPhotos((prev) => [...prev, ...newPhotos]);
//         } catch (error) {
//           console.log("ERROR IN UPLOADING PHOTO", error);
//         }
//       }
//     },
//   );
// };

// <PCProgressBar
//   currentStep={currentStep}
//   totalSteps={STEPS.length}
// ></PCProgressBar>
