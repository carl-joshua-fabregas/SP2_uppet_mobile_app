import { View, Text, StyleSheet } from "react-native";
// import { Themes.COLORS, Themes.SPACING, Themes.RADIUS, Themes.TYPOGRAPHY } from '../theme';
import * as Themes from "../assets/themes/themes";

const ChatBubble = ({ text, isSender, time, status }) => {
  // Handle the Optimistic UI "pending" state
  const isPending = status === "pending";

  return (
    <View
      style={[
        styles.bubbleWrapper,
        isSender ? styles.wrapperSender : styles.wrapperReceiver,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender ? styles.bubbleSender : styles.bubbleReceiver,
          isPending && styles.bubblePending, // Apply grayish tint if sending
        ]}
      >
        <Text style={Themes.TYPOGRAPHY.body}>{text}</Text>

        {/* Timestamp inside the bubble */}
        <Text
          style={[
            Themes.TYPOGRAPHY.label,
            styles.timeText,
            isSender
              ? { color: Themes.COLORS.textDark }
              : { color: Themes.COLORS.textMuted },
          ]}
        >
          {time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    width: "100%",
    paddingHorizontal: Themes.SPACING.md,
    marginVertical: Themes.SPACING.xs,
    flexDirection: "row",
  },
  wrapperSender: {
    justifyContent: "flex-end",
  },
  wrapperReceiver: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%", // Prevents super long messages from stretching edge-to-edge
    padding: Themes.SPACING.md,
  },
  bubbleSender: {
    backgroundColor: Themes.COLORS.primary,
    borderTopLeftRadius: Themes.RADIUS.md,
    borderTopRightRadius: Themes.RADIUS.md,
    borderBottomLeftRadius: Themes.RADIUS.md,
    borderBottomRightRadius: 0, // Tail pointing right
  },
  bubbleReceiver: {
    backgroundColor: Themes.COLORS.soft,
    borderTopLeftRadius: Themes.RADIUS.md,
    borderTopRightRadius: Themes.RADIUS.md,
    borderBottomRightRadius: Themes.RADIUS.md,
    borderBottomLeftRadius: 0, // Tail pointing left
  },
  bubblePending: {
    opacity: 0.6, // Your grayish tint for Optimistic UI
  },
  timeText: {
    alignSelf: "flex-end",
    marginTop: Themes.SPACING.xs,
    opacity: 0.7,
  },
});
