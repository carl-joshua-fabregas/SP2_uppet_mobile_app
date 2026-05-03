import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { VideoView, useVideoPlayer } from "expo-video";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const VideoMessageBubble = ({ videoUrl }) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.pause();
  });

  return (
    <VideoView
      player={player}
      style={styles.mediaConstraints}
      allowsFullscreen
      allowsPictureInPicture
      nativeControls={true}
    />
  );
};

export default function ViewMessageCard({
  message,
  isSender,
  isSelected,
  onToggleSelect,
  onPressImage,
  onOpenOptions, // <-- New prop to trigger the modal
}) {
  if (!message) return null;

  const isMedia =
    message.media?.type === "image" || message.media?.type === "video";
  const isImage = message.media?.type === "image";
  const isPending = message.status === "pending";

  // Media always shows the timestamp. Text only shows it if clicked.
  const showTimestamp = isMedia || isSelected;

  const handlePress = () => {
    onToggleSelect(message._id);
  };

  const handleLongPress = () => {
    if (onOpenOptions) onOpenOptions(message);
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.container,
        isSender ? styles.containerSender : styles.containerReceiver,
      ]}
    >
      <View style={[styles.contentWrapper, isPending && styles.pendingAlpha]}>
        {isMedia ? (
          <View style={styles.mediaContainer}>
            {isImage ? (
              // IMAGE: Tap opens viewer, Long Press opens Modal
              <TouchableOpacity
                onPress={() => onPressImage(message.media)}
                onLongPress={handleLongPress}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: message.media.url }}
                  style={styles.mediaConstraints}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              // VIDEO: No touch wrappers so native controls work perfectly
              <VideoMessageBubble videoUrl={message.media.url} />
            )}
          </View>
        ) : (
          // TEXT: Tap toggles time, Long Press opens Modal
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={[
              styles.bubble,
              isSender ? styles.bubbleSender : styles.bubbleReceiver,
            ]}
          >
            <Text style={styles.messageText}>{message.body}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Render Timestamp */}
      {showTimestamp && (
        // We wrap the timestamp in a TouchableOpacity.
        // This allows users to long-press the time below a video to open the modal!
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={handleLongPress}
          style={[
            styles.statusRow,
            isSender ? styles.statusRowSender : styles.statusRowReceiver,
          ]}
        >
          <Text style={styles.timestampText}>
            {formatTime(message.updatedAt || message.timestamp)}
          </Text>
          {isSender && (
            <View style={styles.receiptContainer}>
              {message.status === "pending" && (
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color="#8E8E93"
                />
              )}
              {message.status === "sent" && (
                <MaterialCommunityIcons
                  name="check"
                  size={14}
                  color="#8E8E93"
                />
              )}
              {message.status === "delivered" && (
                <MaterialCommunityIcons
                  name="check-all"
                  size={14}
                  color="#8E8E93"
                />
              )}
              {message.status === "read" && (
                <MaterialCommunityIcons
                  name="check-all"
                  size={14}
                  color="#34B7F1"
                />
              )}
              {message.status === "failed" && (
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={14}
                  color="red"
                />
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: Themes.SPACING.md,
    marginVertical: Themes.SPACING.xs,
  },
  containerSender: {
    alignItems: "flex-end",
  },
  containerReceiver: {
    alignItems: "flex-start",
  },
  contentWrapper: {
    maxWidth: "80%",
  },
  pendingAlpha: {
    opacity: 0.6,
  },
  bubble: {
    paddingHorizontal: Themes.SPACING.md,
    paddingVertical: Themes.SPACING.sm,
  },
  bubbleSender: {
    backgroundColor: Themes.COLORS.primary,
    borderTopLeftRadius: Themes.RADIUS.md,
    borderTopRightRadius: Themes.RADIUS.md,
    borderBottomLeftRadius: Themes.RADIUS.md,
    borderBottomRightRadius: 0,
  },
  bubbleReceiver: {
    backgroundColor: "#E5E5EA",
    borderTopLeftRadius: Themes.RADIUS.md,
    borderTopRightRadius: Themes.RADIUS.md,
    borderBottomRightRadius: Themes.RADIUS.md,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: Themes.COLORS.textDark,
    fontFamily: Themes.TYPOGRAPHY.body.fontFamily,
    fontSize: Themes.TYPOGRAPHY.body.fontSize,
  },
  mediaContainer: {
    justifyContent: "center", // <-- Centers vertically
    alignItems: "center", // <-- Centers horizontally
    backgroundColor: Themes.COLORS.soft,
  },
  mediaConstraints: {
    width: Dimensions.get("window").width * 0.8, // Ensure media is large enough to see details
    // maxWidth: Dimensions.get("window").width * 0.8, // Prevent media from being too wide
    aspectRatio: 3 / 4, // Common aspect ratio for photos and videos, helps maintain a consistent look
    maxHeight: Dimensions.get("window").width * 0.8, // Prevent videos from being too tall
    borderRadius: Themes.RADIUS.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 2, // A tiny bit of padding makes the timestamp easier to tap/long-press
    paddingHorizontal: 4,
  },
  statusRowSender: {
    justifyContent: "flex-end",
  },
  statusRowReceiver: {
    justifyContent: "flex-start",
  },
  timestampText: {
    fontSize: 10,
    color: "#8E8E93",
    fontFamily: Themes.TYPOGRAPHY.label.fontFamily,
  },
  receiptContainer: {
    marginLeft: 4,
  },
});
