import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import * as Themes from "../../../assets/themes/themes";
import { launchImageLibrary } from "react-native-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { useState } from "react";

export default function PCStep3Component({
  petData,
  setPetData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const handleNext = async () => {
    let newErrors = {};

    if (petData.photos.length === 0) {
      newErrors.photos = "At least one photo is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      onNext();
    }
  };
  const removePhoto = (photoID) => {
    const filtered = petData.photos.filter((p) => {
      p.id !== photoID;
    });
    if (filtered.length > 0 && !filtered.find((p) => p.isProfile === 1)) {
      filtered[0].isProfile = 1;
    }
    update("photos", filtered);
  };
  const renderImages = ({ item }) => {
    return (
      <View style={styles.photoCard}>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => removePhoto(item.id)}
        >
          <Ionicons
            name="trash-outline"
            size={28}
            color={"rgba(255, 255, 255, 0.73)"}
          ></Ionicons>
        </TouchableOpacity>
        <Image source={{ uri: item.url }} style={styles.photoPreview} />
        <View style={styles.cardContent}>
          <TextInput
            placeholder="Enter caption for this photo"
            placeholderTextColor="#A9A9A9"
            value={item.caption}
            onChangeText={(text) => handleCaptionChange(text, item.id)}
            multiline={true}
            style={styles.captionInput}
          />
          <TouchableOpacity
            onPress={() => handleSetProfile(item.id)}
            style={[
              styles.mainIndicator,
              item.isProfile && styles.mainIndicatorActive,
            ]}
          >
            <Ionicons
              name={item.isProfile ? "star" : "star-outline"}
              color={
                item.isProfile ? Themes.COLORS.textDark : Themes.COLORS.primary
              }
              size={13}
            ></Ionicons>
            <Text
              style={[styles.mainText, item.isProfile && styles.mainTextActive]}
            >
              {item.isProfile ? "Main Photo" : "Set as Main"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleAddPhoto = () => {
    console.log("HANDLE ADD PHOTO CALLED");

    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
        selectionLimit: 0,
      },
      async (response) => {
        if (response.didCancel) {
          console.log("GOOD THING I LIKE MY FRIENDS CANCELLED");
        } else if (response.errorCode) {
          console.log("ERROR IN IMAGE PICKING", response.errorCode);
        } else {
          const newPhotos = response.assets.map((asset, index) => ({
            url: asset.uri,
            name: asset.fileName,
            type: asset.type,
            caption: "",
            id: asset.fileName + Date.now().toString() + index, // Use fileName as a temporary ID,
            isProfile:
              petData.photos.length === 0 && index === 0 ? true : false, // Set first photo as profile by default
          }));
          //   console.log("Pet ID IN HANDLE IMAGE READ", petId);

          update("photos", [...petData.photos, ...newPhotos]);
        }
      },
    );
  };

  const handleCaptionChange = (text, photoId) => {
    const updatedPhotos = petData.photos.map((photo) =>
      photo.id === photoId ? { ...photo, caption: text } : photo,
    );
    update("photos", updatedPhotos);
  };

  const handleSetProfile = (photoId) => {
    const updatedPhotos = petData.photos.map((photo) => ({
      ...photo,
      isProfile: photo.id === photoId ? true : false,
    }));
    update("photos", updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={petData.photos}
        renderItem={renderImages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollPadding}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <TouchableOpacity
              onPress={handleAddPhoto}
              style={styles.uploadArea}
            >
              <Ionicons
                name={"image-outline"}
                color={Themes.COLORS.primary}
                size={28}
              ></Ionicons>
              <Text style={styles.uploadTitle}>Add Pet Photos</Text>
              <Text style={styles.uploadSub}>Show off their best angles!</Text>
            </TouchableOpacity>
            {errors.photos && (
              <Text style={styles.errorText}>{errors.photos}</Text>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
    // <View style={styles.container}>
    //   <TouchableOpacity onPress={handleAddPhoto} style={styles.nextButton}>
    //     <Text style={styles.nextButtonText}>Add Photos</Text>
    //   </TouchableOpacity>
    //   {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
    //   <FlatList
    //     data={petData.photos}
    //     renderItem={renderImages}
    //     keyExtractor={(item) => item.id}
    //   />
    //   <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
    //     <Text style={styles.nextButtonText}>Next</Text>
    //   </TouchableOpacity>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Themes.COLORS.background },
  scrollPadding: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 100 },

  // UPLOAD DASHED BOX
  uploadArea: {
    height: 140,
    borderWidth: 2,
    borderColor: Themes.COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 20,
    backgroundColor: "#F8FFF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },
  uploadTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 18,
    color: Themes.COLORS.primary,
    marginTop: 8,
  },
  uploadSub: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 12,
    color: Themes.COLORS.textFaded,
  },

  // PHOTO CARDS
  photoCard: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
  photoPreview: { width: "100%", height: 250 },
  deleteIcon: {
    position: "absolute",
    top: Themes.SPACING.sm,
    right: Themes.SPACING.sm,
    zIndex: 10,
  },

  cardContent: { padding: 18 },
  captionInput: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 10,
    marginBottom: 15,
  },

  // MAIN PHOTO BUTTON
  mainIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  mainIndicatorActive: { backgroundColor: Themes.COLORS.primary },
  mainText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    color: "#999",
    marginLeft: 6,
  },
  mainTextActive: { color: "#FFF", fontWeight: "bold" },

  // NAVIGATION
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
  errorText: {
    color: "#FF6B6B",
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 15,
  },
});

// const styles = StyleSheet.create({
//   PCStep1ComponentContainer: {
//     flex: 1,
//     backgroundColor: "#FFF9F5",
//   },
//   label: {
//     fontSize: 12,
//     fontWeight: 300,
//     marginBottom: 4,
//     letterSpacing: 0.1,
//   },
//   input: {
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 12,
//     borderRadius: 16,
//     fontSize: 14,
//     borderWidth: 1.5,
//     borderColor: "#FDF2E9",
//   },
//   bioTextArea: {
//     minHeight: 80,
//     textAlignVertical: "top",
//     multiline: true,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 8,
//     fontSize: 11,
//     letterSpacing: 0.1,
//     marginTop: -8,
//   },
//   inputError: {
//     borderColor: "red",
//   },
//   field: {
//     marginBottom: 10,
//   },
//   nextButton: {
//     backgroundColor: "#efb07d",
//     paddingVertical: 12,
//     borderRadius: 16,
//   },
//   nextButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "center",
//   },
// });
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF9F5",
//     padding: 16,
//   },
//   addButton: {
//     backgroundColor: "#fff",
//     borderWidth: 1.5,
//     borderColor: "#efb07d",
//     padding: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   addButtonText: {
//     color: "#efb07d",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   listContainer: {
//     paddingBottom: 20,
//   },
//   errorText: {
//     color: "red",
//     marginBottom: 12,
//     fontSize: 12,
//     textAlign: "center",
//   },
//   nextButton: {
//     backgroundColor: "#efb07d",
//     paddingVertical: 14,
//     borderRadius: 16,
//     marginTop: 10,
//   },
//   nextButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     textAlign: "center",
//   },

//   // Photo Card Styles
//   image: {
//     backgroundColor: "white",
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: "hidden",
//     borderWidth: 1.5,
//     borderColor: "#FDF2E9",
//   },
//   photoPreview: {
//     width: "100%",
//     height: 220,
//     backgroundColor: "#eaeaea", // Placeholder color while loading
//   },
//   controls: {
//     padding: 14,
//   },
//   captionInput: {
//     borderWidth: 1.5,
//     borderColor: "#FDF2E9",
//     borderRadius: 12,
//     padding: 10,
//     marginBottom: 12,
//     backgroundColor: "#fff",
//     fontSize: 14,
//   },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   badge: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 20,
//   },
//   activeBadge: {
//     backgroundColor: "#efb07d",
//   },
//   inactiveBadge: {
//     backgroundColor: "#FDF2E9",
//   },
//   badgeText: {
//     fontWeight: "600",
//     color: "#333",
//     fontSize: 12,
//   },
//   removeText: {
//     color: "red",
//     fontWeight: "600",
//     fontSize: 13,
//   },
// });

// try {
//                   await Promise.all(
//                     newPhotos.map(async (photo) => {
//                       const presignResponse = await api.post(
//                         "api/pet/presignUploadURL",
//                         {
//                           fileName: photo.name,
//                           fileType: photo.type,
//                           petId: petId,
//                           // uri: photo.uri,
//                           // name: photo.name,
//                         },
//                       );
//                       const { url, key } = presignResponse.data.body;
//                       const fetchImage = await fetch(photo.uri);
//                       console.log("FETCHED IMAGE FOR UPLOAD:", fetchImage);
//                       const blob = await fetchImage.blob();
//                       console.log("blob", blob);

//                       // await api.put(url, blob,
//                       //   { headers: { "Content-Type": photo.type } }
//                       // );
//                       await fetch(url, {
//                         method: "PUT",
//                         body: blob,
//                         contentType: photo.type,
//                       });
//                       // "x-amz-meta-uri": photo.uri, "x-amz-meta-name": photo.name
//                       console.log("UPLOADED PHOTO TO S3 WITH KEY:", key);
//                       console.log("NOW NOTIFYING BACKEND ABOUT THE UPLOADED PHOTO");

//                       await api.post(`api/pet/${petId}/photo`, {
//                         key: key,
//                         caption: caption,
//                         isProfile: 1,
//                       });
//                       console.log("UPLOAD SUCCESSFUL FOR PHOTO WITH KEY:", key);
//                     }),
//                   );
//                   setPhotos((prev) => [...prev, ...newPhotos]);
//                 } catch (error) {
//                   console.log("ERROR IN UPLOADING PHOTO", error);
//                 }
//               }
