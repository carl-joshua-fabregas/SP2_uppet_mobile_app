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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

export default function PCStep3Component({ petData, setPetData, errors }) {
  const update = (key, value) =>
    setPetData((prev) => ({ ...prev, [key]: value }));

  const removePhoto = (photoKey) => {
    const filtered = petData.photos.filter((p) => p.key !== photoKey);
    if (filtered.length > 0 && !filtered.find((p) => p.isProfile)) {
      filtered[0].isProfile = true;
    }
    update("photos", filtered);
  };

  const renderImages = ({ item }) => {
    return (
      <View style={styles.photoCard}>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => removePhoto(item.key)}
        >
          <Ionicons
            name="trash-outline"
            size={28}
            color={"rgba(255, 255, 255, 0.9)"}
          />
        </TouchableOpacity>
        <Image source={{ uri: item.url }} style={styles.photoPreview} />
        <View style={styles.cardContent}>
          <TextInput
            placeholder="Enter caption for this photo"
            placeholderTextColor="#A9A9A9"
            value={item.caption}
            onChangeText={(text) => handleCaptionChange(text, item.key)}
            multiline={true}
            style={styles.captionInput}
          />
          <TouchableOpacity
            onPress={() => handleSetProfile(item.key)}
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
              size={14}
            />
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
    launchImageLibrary(
      {
        mediaType: "photo",
        quality: 1,
        selectionLimit: 0,
      },
      async (response) => {
        if (!response.didCancel && !response.errorCode) {
          const newPhotos = response.assets.map((asset, index) => ({
            url: asset.uri,
            name: asset.fileName,
            type: asset.type,
            caption: "",
            size: asset.fileSize,
            id: `pets/${petData._id ?? Date.now()}/${asset.fileSize}_${asset.fileName}`,
            key: `pets/${petData._id ?? Date.now()}/${asset.fileSize}_${asset.fileName}`,
            isProfile:
              petData.photos.length === 0 && index === 0 ? true : false,
          }));
          update("photos", [...petData.photos, ...newPhotos]);
        }
      },
    );
  };

  const handleCaptionChange = (text, photoKey) => {
    const updatedPhotos = petData.photos.map((photo) =>
      photo.key === photoKey ? { ...photo, caption: text } : photo,
    );
    update("photos", updatedPhotos);
  };

  const handleSetProfile = (photoKey) => {
    const updatedPhotos = petData.photos.map((photo) => ({
      ...photo,
      isProfile: photo.key === photoKey ? true : false,
    }));
    update("photos", updatedPhotos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="image-multiple"
            size={20}
            color={Themes.COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Pet Photos</Text>
        </View>

        <TouchableOpacity onPress={handleAddPhoto} style={styles.uploadArea}>
          <Ionicons
            name={"image-outline"}
            color={Themes.COLORS.primary}
            size={32}
          />
          <Text style={styles.uploadTitle}>Add Pet Photos</Text>
          <Text style={styles.uploadSub}>Show off their best angles!</Text>
        </TouchableOpacity>
        {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
      </View>

      {/* 🌟 Map through photos instead of FlatList */}
      {petData.photos.map((item, index) => (
        <View key={item._id || item.key || index}>
          {renderImages({ item })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Themes.COLORS.background },

  // App-standard headers and cards applied to the top upload area
  sectionCard: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    padding: Themes.SPACING.md,
    marginBottom: Themes.SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Themes.SPACING.sm,
    paddingBottom: Themes.SPACING.xs,
  },
  sectionTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.primary,
    marginLeft: Themes.SPACING.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // UPLOAD DASHED BOX
  uploadArea: {
    height: 140,
    borderWidth: 2,
    borderColor: Themes.COLORS.primary,
    borderStyle: "dashed",
    borderRadius: Themes.RADIUS.md,
    backgroundColor: "#F8FFF8",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Themes.SPACING.sm,
  },
  uploadTitle: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: 16,
    color: Themes.COLORS.primary,
    marginTop: 8,
  },
  uploadSub: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    color: Themes.COLORS.textMuted,
  },

  // PHOTO CARDS - Updated to match app card standards
  photoCard: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.md,
    marginBottom: Themes.SPACING.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    overflow: "hidden",
    marginHorizontal: 2, // Helps prevent clipping the drop shadow
  },
  photoPreview: { width: "100%", height: 250 },
  deleteIcon: {
    position: "absolute",
    top: Themes.SPACING.sm,
    right: Themes.SPACING.sm,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 4,
  },

  cardContent: { padding: Themes.SPACING.md },
  captionInput: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 8,
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

  errorText: {
    color: "#FF6B6B",
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: 13,
    textAlign: "center",
    marginTop: 5,
  },
});
