import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import * as Themes from "../assets/themes/themes";

export default function PetModal({ pet, onClose }) {
  return (
    <Modal
      visible={!!pet}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Text>{pet?.name}</Text>
            <Text>{pet?.bio}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    height: "80%",
    backgroundColor: Themes.COLORS.card,
    borderTopLeftRadius: Themes.RADIUS.lg,
    borderTopRightRadius: Themes.RADIUS.lg,
    padding: Themes.SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Themes.COLORS.textDark + "40",
    justifyContent: "flex-end",
    padding: Themes.SPACING.md,
  },
});

// backgroundColor: "rgba(29, 59, 46, 0.7)",
