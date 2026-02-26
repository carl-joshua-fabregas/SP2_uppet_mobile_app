import { Text, View } from "react-native";
import {launchImageLibrary} from "react-native-image-picker"
import CreatePetCard from "../component/CreatePetCard";
const api = require("../api/axios");
import { useState } from "react";
export default function CreateProfile() {
  const [photos, setPhotos] = useState([]);
  
  const handleImageRead  = (petId, caption) => {
    console.log("HANDLE IMAGE READ CALLED WITH PET ID:", petId);
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
        selectionLimit: 0,
      },
      async (response) => {
        if(response.didCancel){
          console.log("GOOD THING I LIKE MY FRIENDS CANCELLED")
        } else if (response.errorCode){
          console.log("ERROR IN IMAGE PICKING", response.errorCode)
        } else {
          const newPhotos = response.assets.map((asset) => ({
            uri: asset.uri,
            name: asset.fileName,
            type: asset.type,
          }));
          console.log("Pet ID IN HANDLE IMAGE READ", petId);
          try{
            await Promise.all(
              newPhotos.map( async (photo) => {
                const presignResponse = await api.post("api/pet/presignUploadURL", {
                  fileName: photo.name,
                  fileType: photo.type,
                  petId: petId
                  // uri: photo.uri,
                  // name: photo.name,
                });
                const { url, key } = presignResponse.data.body;
                const fetchImage = await fetch(photo.uri);
                console.log("FETCHED IMAGE FOR UPLOAD:", fetchImage);
                const blob = await fetchImage.blob();
                console.log("blob", blob);
                
              // await api.put(url, blob, 
              //   { headers: { "Content-Type": photo.type } }
              // );
              await fetch(url, {
                method: "PUT",
                body: blob,
                contentType: photo.type,
              });
                // "x-amz-meta-uri": photo.uri, "x-amz-meta-name": photo.name
              console.log("UPLOADED PHOTO TO S3 WITH KEY:", key);
              console.log("NOW NOTIFYING BACKEND ABOUT THE UPLOADED PHOTO");
              
              await api.post(`api/pet/${petId}/photo`, {
                  key: key,
                  caption: caption,
                  isProfile: 1,
              })
              console.log("UPLOAD SUCCESSFUL FOR PHOTO WITH KEY:", key);
          })
        )
        setPhotos(prev => [...prev, ...newPhotos]);
          } catch (error){
            console.log("ERROR IN UPLOADING PHOTO", error)
          }
        }
      }
    )
    
  }
  return (
    <View>
      <CreatePetCard handleImageRead={handleImageRead}></CreatePetCard>
    </View>
  );
}
