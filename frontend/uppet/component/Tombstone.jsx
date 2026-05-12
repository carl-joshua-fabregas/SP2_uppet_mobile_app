import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from "./themes";

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
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: "center",
    width: "100%",
    // Subtle border using your soft color
    borderWidth: 2,
    borderColor: COLORS.soft,
    // Soft shadow to lift the card off the background
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.soft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    ...TYPOGRAPHY.heading,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted, // Using muted text so it doesn't overpower the heading
    textAlign: "center",
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: COLORS.badge,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    ...TYPOGRAPHY.badgeText,
  },
});
