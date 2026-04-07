export const COLORS = {
  primary: "#A8E6CF", // mint green — buttons, active dots, progress bar
  primaryDark: "#84D1B6", // pressed state
  soft: "#DDF5EB", // borders, inactive connectors, photo slots
  background: "#F5FCF9", // page background
  card: "#FFFFFF", // card surface
  textDark: "#1D3B2E", // headings and review values (dark forest green)
  textMuted: "#7CA896", // labels, hints, inactive dots
  badge: "#DDF5EB", // trait pill background
  badgeText: "#52AD8A", // trait pill text (slightly darker for legibility)
};

export const SPACING = {
  xs: 4, //Smallest spacing, for tight gaps
  sm: 8, //Small spacing, for minor separation
  md: 16, //Medium spacing, for standard separation between sections
  lg: 24, //Large spacing, for clear separation between major sections
  xl: 32, //Extra large spacing, for significant separation or padding
  xxl: 48, //Extra extra large spacing, for very spacious layouts or padding
};

export const RADIUS = {
  sm: 8, // Small border radius for subtle rounding
  md: 16, // Medium border radius for standard rounding on cards and buttons
  lg: 24, // Large border radius for heavily rounded elements
  pill: 9999, // Pill-shaped radius for badges and tags
};

export const TYPOGRAPHY = {
  // For Names and Screen Titles
  heading: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 24,
    color: COLORS.textDark,
  },

  subheading: {
    fontFamily: "Fredoka-SemiBold",
    fontSize: 20,
    color: COLORS.textDark,
  },

  subsubheading: {
    fontFamily: "Fredoka-Medium",
    fontSize: 16,
    color: COLORS.textDark,
  },

  body: {
    fontFamily: "Fredoka-Regular",
    fontSize: 14,
    color: COLORS.textDark,
  },
  // For Badges and Trait Pills
  badgeText: {
    fontFamily: "Fredoka-Medium",
    fontSize: 10,
    color: COLORS.badgeText,
  },

  // For Labels and Hints
  label: {
    fontFamily: "Fredoka-Regular",
    fontSize: 10,
    color: COLORS.textMuted,
  },
};
