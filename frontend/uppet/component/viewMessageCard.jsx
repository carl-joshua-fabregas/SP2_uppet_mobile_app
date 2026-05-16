import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import * as Themes from "../assets/themes/themes";
import { VideoView, useVideoPlayer } from "expo-video";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEventListener } from "expo";

const VideoMessageBubble = ({ videoUrl, onLongPress }) => {
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = false;
    p.pause();
    p.timeUpdateEventInterval = 0.1; // Update progress every 500ms
  });

  useEventListener(player, "timeUpdate", (event) => {
    if (player.duration > 0) {
      setProgress(event.currentTime / player.duration);
    }
  });

  const togglePlay = () => {
    playing ? player.pause() : player.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    player.muted = !player.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      playerRef.current?.enterFullscreen();
    }
  };

  return (
    <View style={styles.videoWrapper}>
      {/* Video sits at the base layer */}
      <VideoView
        ref={playerRef}
        player={player}
        style={styles.mediaConstraints}
        nativeControls={false}
        contentFit="cover"
      />

      {/* Transparent overlay covers the video to intercept press & long press */}
      <Pressable
        onPress={togglePlay}
        onLongPress={onLongPress}
        style={StyleSheet.absoluteFill}
      />

      {/* Play icon shown when paused — pointerEvents="none" so it doesn't block the overlay */}
      {!playing && (
        <View style={styles.centerOverlay} pointerEvents="none">
          <MaterialCommunityIcons
            name="play-circle"
            size={54}
            color="rgba(255, 255, 255, 0.85)"
          />
        </View>
      )}

      {/* Bottom controls — these sit above the overlay so their touches still work */}
      <View style={styles.bottomControls}>
        <Slider
          style={{ width: "100%", height: 20 }}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="rgba(255,255,255,0.4)"
          thumbTintColor="#FFFFFF" // This is the circle
          onSlidingStart={() => player.pause()}
          onSlidingComplete={(val) => {
            player.currentTime = val * player.duration;
            if (playing) player.play();
          }}
        />

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
            <MaterialCommunityIcons
              name={isMuted ? "volume-off" : "volume-high"}
              size={20}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFullscreen}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="fullscreen" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ... keep your ViewMessageCard exactly as is ...
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
  message.media?.type?.startsWith("image/") || 
  message.media?.type?.startsWith("video/");

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
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              // VIDEO: No touch wrappers so native controls work perfectly

              <VideoMessageBubble
                videoUrl={message.media.url}
                onLongPress={handleLongPress}
              />
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
    borderRadius: Themes.RADIUS.md,
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
  // Add these to your existing styles
  videoWrapper: {
    position: "relative",
    borderRadius: Themes.RADIUS.md,
    overflow: "hidden", // Ensures the overlays don't bleed outside the bubble
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Ensures the play button stays above the video
  },
  bottomControls: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: "column",
    zIndex: 3, // was 2 — needs to be above the Pressable overlay
  },
  sliderTrack: {
    width: "100%", // Take up full width of the bubble
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 2,
    marginBottom: 8, // Add space between the slider and the buttons
    overflow: "hidden",
  },
  sliderFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between", // Pushes volume to left, fullscreen to right
    alignItems: "center",
    width: "100%",
  },
  iconButton: {
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 15,
  },
  volumeButton: {
    padding: 4,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 15,
  },
});
