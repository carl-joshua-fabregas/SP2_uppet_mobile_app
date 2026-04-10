import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";

import { useState } from "react";

export default function PCStep3Component({ petData, setPetData, onNext, onBack }) {
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

  const renderImages = ({ item }) => {
    return (
      <View style={styles.image}>
        <Image source={{ uri: item.uri }} style={styles.photoPreview} />
        <View style={styles.captionContainer}>
          <TextInput
            placeholder="Enter caption for this photo"
            value={item.caption}
            onChangeText={(text) => handleCaptionChange(text, item.id)}
            style={styles.captionInput}
          />
        </View>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => handleSetProfile(item.id)}>
            <Text style={styles.badgeText}>
              {item.isProfile ? "⭐ Main Photo" : "Set as Main"}
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
            uri: asset.uri,
            name: asset.fileName,
            type: asset.type,
            caption: "",
            id: asset.fileName + Date.now().toString() + index, // Use fileName as a temporary ID,
            isProfile: petData.photos.length === 0 && index === 0, // Set first photo as profile by default
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
      isProfile: photo.id === photoId,
    }));
    update("photos", updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleAddPhoto} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Add Photos</Text>
      </TouchableOpacity>
      {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
      <FlatList
        data={petData.photos}
        renderItem={renderImages}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

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
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F5",
    padding: 16,
  },
  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#efb07d",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#efb07d",
    fontWeight: "600",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 12,
    fontSize: 12,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#efb07d",
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 10,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Photo Card Styles
  image: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#FDF2E9",
  },
  photoPreview: {
    width: "100%",
    height: 220,
    backgroundColor: "#eaeaea", // Placeholder color while loading
  },
  controls: {
    padding: 14,
  },
  captionInput: {
    borderWidth: 1.5,
    borderColor: "#FDF2E9",
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeBadge: {
    backgroundColor: "#efb07d",
  },
  inactiveBadge: {
    backgroundColor: "#FDF2E9",
  },
  badgeText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 12,
  },
  removeText: {
    color: "red",
    fontWeight: "600",
    fontSize: 13,
  },
});
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
