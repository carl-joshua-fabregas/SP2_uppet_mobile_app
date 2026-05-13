import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Themes from "../assets/themes/themes.js";
export default function Tombstone({ page = "Page" }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Playful placeholder icon for UPPET */}
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🐾</Text>
        </View>

        {/* Heading and Body */}
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.message}>
          It looks like this {page.toLowerCase()} wandered off and couldn't be
          found.
        </Text>

        {/* Badge to show the status */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Not Found</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Themes.COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Themes.SPACING.lg,
  },
  card: {
    backgroundColor: Themes.COLORS.card,
    borderRadius: Themes.RADIUS.lg,
    padding: Themes.SPACING.xl,
    alignItems: "center",
    width: "100%",
    // Subtle border using your soft color
    borderWidth: 2,
    borderColor: Themes.COLORS.soft,
    // Soft shadow to lift the card off the background
    shadowColor: Themes.COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: Themes.RADIUS.pill,
    backgroundColor: Themes.COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Themes.SPACING.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...Themes.TYPOGRAPHY.heading,
    marginBottom: Themes.SPACING.sm,
    textAlign: "center",
  },
  message: {
    ...Themes.TYPOGRAPHY.body,
    color: Themes.COLORS.textMuted, // Using muted text so it doesn't overpower the heading
    textAlign: "center",
    marginBottom: Themes.SPACING.lg,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: Themes.COLORS.badge,
    paddingVertical: Themes.SPACING.xs,
    paddingHorizontal: Themes.SPACING.sm,
    borderRadius: Themes.RADIUS.pill,
  },
  badgeText: {
    ...Themes.TYPOGRAPHY.badgeText,
  },
});
