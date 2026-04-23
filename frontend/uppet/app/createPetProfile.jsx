import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
// import PCProgressBar from "../component/PetCreationSteps/PCProgressBar";
import PCProgressTracker from "../component/PetCreationSteps/PCProgressTracker";
import PCStep1Component from "../component/PetCreationSteps/steps/PCStep1Component";
import PCStep2Component from "../component/PetCreationSteps/steps/PCStep2Component";
import PCStep3Component from "../component/PetCreationSteps/steps/PCStep3Component";
import PCStep4Component from "../component/PetCreationSteps/steps/PCStep4Component";
import PCStep5Component from "../component/PetCreationSteps/steps/PCStep5Component";
import * as Themes from "../assets/themes/themes";
import { api } from "../api/axios";

import { useState } from "react";
export default function CreateProfile() {
  const router = useRoute();
  const navigation = useNavigation();
  const { editPetData } = router.params ?? {};
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [pet, setPet] = useState(
    editPetData ?? {
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
    },
  );
  const [errors, setErrors] = useState({});
  const STEPS = [
    { label: "Basic Info" },
    { label: "Health & Behavior" },
    { label: "Gallery Photos" },
    { label: "Review" },
    { label: "PET PROFILE CARD CREATED" },
  ];
  const validators = () => {
    const newErrors = {};
    switch (currentStep) {
      case 0: {
        if (!pet.name) {
          newErrors.name = "Name is required";
        }
        if (!pet.age) {
          newErrors.age = "Age is required";
        }
        if (isNaN(Number(pet.age))) {
          newErrors.age = "Please enter a valid number for Age";
        }
        if (!pet.sex) {
          newErrors.sex = "Sex is required";
        }
        if (!pet.species) {
          newErrors.species = "Species is required";
        }
        if (!pet.breed) {
          newErrors.breed = "Breed is required";
        }
        if (!pet.bio) {
          newErrors.bio = "Bio is required";
        }
        break;
      }
      case 1: {
        if (!pet.size) {
          newErrors.size = "Size is required";
        }
        if (!pet.vaccination) {
          newErrors.vaccination = "Vaccination status is required";
        }
        if (isNaN(Number(pet.weight))) {
          newErrors.weight = "Please enter a valid number for Weight";
        }
        if (!pet.sex) {
          newErrors.sex = "Please specify sex";
        }
        if (!pet.sn) {
          newErrors.sn = "Please specify if your pet is spayed/neutered";
        }
        if (!pet.specialNeeds) {
          newErrors.specialNeeds = "Please Put NA";
        }
        if (!pet.healthCond) {
          newErrors.healthCond = "Health condition is required";
        }
        if (!pet.behavior) {
          newErrors.behavior = "Behavior is required";
        }
        break;
      }
      case 2: {
        if (pet.photos.length === 0) {
          newErrors.photos = "At least one photo is required";
        }
        break;
      }
      default:
        break;
      // Validate required fields
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    } else {
      setErrors({});
      // Proceed to next step
      return true;
    }
  };
  const handleNext = async () => {
    if (currentStep < STEPS.length - 1 && validators()) {
      if (currentStep === STEPS.length - 2 && !editPetData) {
        await createPet();
      } else if (currentStep === STEPS.length - 2 && editPetData) {
        await saveEditPet();
      }
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const saveEditPet = async () => {
    const { photos: oldPetPhotos, ...oldPetForm } = editPetData;
    const { photos: newPetPhotos, ...newPetForm } = pet;
    console.log("SAVE AND EDIT OLD", editPetData);
    console.log("NEW PET DATA", pet);
    const photosDeleted = oldPetPhotos.filter(
      (oldPhoto) =>
        !newPetPhotos.find((newPhoto) => newPhoto.key === oldPhoto.key),
    );
    const hasDeleted = photosDeleted.length > 0;

    const photosAdded = newPetPhotos.filter(
      (newPhoto) =>
        !oldPetPhotos.find((oldPhoto) => oldPhoto.key === newPhoto.key),
    );
    const hasNewPhoto = photosAdded.length > 0;

    //Check if there are any caption changes
    const hasNewCaptions = newPetPhotos.some((newPhoto) => {
      const matchedPhoto = oldPetPhotos.find(
        (oldPhoto) => oldPhoto.key === newPhoto.key,
      );
      return matchedPhoto && matchedPhoto.caption !== newPhoto.caption;
    });

    const oldMain = oldPetPhotos.find((p) => p.isProfile)?.key;
    const newMain = newPetPhotos.find((p) => p.isProfile)?.key;
    const hasMainPhotoChanged = oldMain !== newMain;
    const isFormUnchanged =
      JSON.stringify(oldPetForm) === JSON.stringify(newPetForm);

    const isPhotoUnchanged =
      !hasDeleted && !hasNewCaptions && !hasNewPhoto && !hasMainPhotoChanged;

    if (isPhotoUnchanged && isFormUnchanged) {
      console.log("NOTHING TO CHANGE");
      return;
    }
    try {
      setUploading(true);
      if (hasDeleted) {
        const resDelete = await Promise.all(
          photosDeleted.map(async (photo) => {
            console.log("THIS IS THE PHOTO TO DELETE", photo);
            const preSignDeletUrlRes = await api.post(
              `/api/pet/presignDeleteURL`,
              {
                key: photo.key,
              },
            );

            const { url, key } = preSignDeletUrlRes.data.body;
            console.log("Starting to Delete Photo", key);
            const awsDelRes = await fetch(url, {
              method: "DELETE",
            });
            console.log("DELETE PHOTO RESPONSE", awsDelRes.status);
          }),
        );
      }
      let finalPetArray = pet;
      if (hasNewPhoto) {
        console.log("FOUND NEW PHOTOS");
        const uploadedPhotos = await Promise.all(
          photosAdded.map(async (photo) => {
            console.log("This is the photo being updated", photo.key);
            const preSignRes = await api.post(`/api/pet/presignUploadURL`, {
              fileName: photo.name,
              petID: pet._id,
              fileType: photo.type,
              fileSize: photo.size,
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
        const finalPetPhotoRes = await api.patch(`api/pet/${pet._id}/photo`, {
          photos: uploadedPhotos,
        });
        // finalPetPhotosArray = finalPetPhotosArray.map((photo) => {
        //   const uploadedFinal = uploadedPhotos.find(
        //     (up) => up.key === photo.key,
        //   );
        //   if (uploadedFinal) {
        //     return uploadedFinal;
        //   }
        //   return photo;
        // });
        // console.log(
        //   "THHHHHIS IS THE FINAL ARRAY",
        //   finalPetPhotosArray,
        //   uploadedPhotos,
        // );
        finalPetArray = finalPetPhotoRes.data.body;
      }
      console.log("FINAL PHOTOS ARRAY", finalPetArray);
      const finalPetFormRes = await api.patch(`/api/pet/${pet._id}`, {
        ...finalPetArray,
      });
    } catch (err) {
      console.log("Error in save edit", err.message);
    } finally {
      setUploading(false);
    }
  };
  const createPet = async () => {
    console.log("Creating Pet");
    try {
      setUploading(true);
      const petCreationRes = await api.post(`api/pet/post`, {
        ...pet,
        photos: [],
      });
      const petCreated = petCreationRes.data;
      const petID = petCreated.body._id;
      console.log("PET CREATED PETID", petCreated, petID);

      const uploadedPhotos = await Promise.all(
        pet.photos.map(async (photo) => {
          console.log(photo);
          const preSignRes = await api.post(`api/pet/presignUploadURL`, {
            fileName: photo.name,
            petID: petID,
            fileType: photo.type,
            fileSize: photo.size,
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
      setUploading(false);
      return true;
    } catch (err) {
      console.error(err);
    } finally {
      console.log("OKAY NA NA UPLOAD NA TEH");
    }
  };
  const renderFooter = () => {
    return (
      <View style={styles.inlineFooterContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, uploading && styles.disabledButton]}
          onPress={handleNext}
          disabled={uploading}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 2 ? "Finish & Save" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  const onFinish = (petData) => {
    console.log("FINISHED CREATING PET");
    navigation.goBack();
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PCStep1Component
            petData={pet}
            setPetData={setPet}
            errors={errors}
            renderFooter={renderFooter}
          />
        );
      case 1:
        return (
          <PCStep2Component
            petData={pet}
            setPetData={setPet}
            errors={errors}
            renderFooter={renderFooter}
          />
        );
      case 2:
        return (
          <PCStep3Component
            petData={pet}
            setPetData={setPet}
            errors={errors}
            renderFooter={renderFooter}
          />
        );
      case 3:
        return (
          <PCStep4Component
            petData={pet}
            uploading={uploading}
            renderFooter={renderFooter}
          ></PCStep4Component>
        );
      case 4:
        return (
          <PCStep5Component
            petData={pet}
            onFinish={onFinish}
          ></PCStep5Component>
        );
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 👈 Spaces them out
    marginTop: 30,
    paddingBottom: 20, // 👈 Ensures it's not hugging the bottom of the screen
  },
  backButton: {
    paddingVertical: Themes.SPACING.md,
    paddingHorizontal: 25,
    borderRadius: Themes.RADIUS.md,
    backgroundColor: "#F5F5F5", // 👈 Give it a light background to look like a button
    marginRight: 10,
    elevation: 3,
  },
  nextButton: {
    flex: 1, // 👈 Takes up the remaining width
    backgroundColor: Themes.COLORS.primary,
    paddingVertical: Themes.SPACING.md,
    borderRadius: Themes.RADIUS.md,
    alignItems: "center",
    elevation: 3,
  },
  backButtonText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    color: Themes.COLORS.textMuted, // A light gray
    fontSize: 16,
  },
  nextButtonText: {
    color: "#FFF",
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
  },
  inlineFooterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30, // Pushes the buttons down from the last input
    marginBottom: 20,
    width: "100%",
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

// const [pet, setPet] = useState({
//     name: "",
//     age: "",
//     bio: "",
//     sex: "",
//     species: "",
//     breed: "",
//     size: "",
//     weight: "",
//     vaccination: "",
//     sn: "",
//     healthCond: "",
//     behavior: "",
//     specialNeeds: "",
//     otherInfo: "",
//     photos: [],
//   });
