import { View, Text, Image, StyleSheet, Button, Pressable } from "react-native";
import { useState, useEffect } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import * as Themes from "../assets/themes/themes.js";
export default function ProfileDrawer(props) {
  const { user, logout } = useUser();
  const router = useNavigation();

  const handleProfileClick = () => {
    console.log("IT HAS BEEN PRESSED");
    router.navigate("viewProfile");
  };

  const handleSignOut = async () => {
    try {
      console.log("Signed OUT");
      logout();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <View style={styles.profileDrawerContainer}>
      <Pressable style={styles.profileContainer} onPress={handleProfileClick}>
        <Image
          source={{
            uri: user.profilePhoto.url,
          }}
          style={styles.profileImage}
        ></Image>
      </Pressable>
      <Text style={styles.nameText}>
        {user.firstName} {user.middleName} {user.lastName}
      </Text>
      <View style={{ paddingVertical: Themes.SPACING.md }}>
        <Button title="Sign Out" onPress={handleSignOut}></Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileDrawerContainer: {
    width: "100%",
    padding: 100,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Themes.COLORS.primary,
    marginBottom: Themes.SPACING.sm,
  },
  fullName: {
    fontFamily: Themes.TYPOGRAPHY.heading.fontFamily,
    fontSize: Themes.TYPOGRAPHY.subsubheading.fontSize,
    color: Themes.COLORS.text,
    textAlign: "center",
  },
  nameText: {
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
    color: Themes.COLORS.textFaded,
    textAlign: "center",
    marginTop: Themes.SPACING.sm,
    paddingHorizontal: Themes.SPACING.md,
  },
});
