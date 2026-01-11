import { scale, verticalScale } from "@/utils/styling";

// 1. PALETTE (Warna Mentah)
const palette = {
  primary: "#23C16B",
  primaryLight: "#35E086",
  primaryDark: "#1A8B4D",

  rose: "#FF4D4D",
  roseLight: "#FB7185",
  white: "#FFFFFF",
  black: "#000000",

  // Dark Forest (Warna Lama Anda)
  forest900: "#0C1A14",
  forest800: "#14261F",
  forest700: "#1A2E26",
  forest600: "#475569",
  forest500: "#64748b",
  forest400: "#94a3b8",
  forest300: "#d4d4d4",
  forest200: "#e5e5e5",
  forest100: "#E6E9E7",
  forest50: "#F2F4F3",

  forestText: "#FFFFFF",
  forestTextLight: "#A9B3AD",
  forestTextLighter: "#7C8A82",

  // Light Mode (Warna Baru)
  lightBg: "#FFFFFF",
  lightCard: "#F3F4F6",
  lightInput: "#E5E7EB",
  lightText: "#111827",
  lightTextSoft: "#4B5563",
};

// 2. THEMES (Logic Mapping)
export const themes = {
  dark: {
    mode: 'dark',

    // Background & Surfaces
    background: palette.forest900,
    backgroundAlt: palette.forest800,
    card: palette.forest700,
    input: palette.forest800,

    // Text
    text: palette.forestText,
    textLight: palette.forestTextLight,
    textLighter: palette.forestTextLighter,

    // Borders
    border: palette.forest800,

    // Primary
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryDark: palette.primaryDark,
    accentGreen: palette.primary,

    // Semantic Colors
    rose: palette.rose,
    roseLight: palette.roseLight,
    green: palette.primary,

    // Neutral Scale (Legacy Support)
    neutral900: palette.forest900,
    neutral800: palette.forest800,
    neutral700: palette.forest700,
    neutral600: palette.forest600,
    neutral500: palette.forest500,
    neutral400: palette.forest400,
    neutral300: palette.forest300,
    neutral200: palette.forest200,
    neutral100: palette.forest100,
    neutral50: palette.forest50,
    neutral350: "#CCCCCC",

    // Extended Palette
    white: palette.white,
    black: palette.black,

    // Special Cards & Components
    cardSecondary: palette.forest700,
    cardTertiary: palette.forest700,

    // Shadows & Overlays
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowMedium: "rgba(0, 0, 0, 0.5)",
    shadowStrong: "rgba(0, 0, 0, 0.7)",
    overlay: "rgba(0, 0, 0, 0.6)",
  },

  light: {
    mode: 'light',

    // Background & Surfaces - Soft & Clean
    background: "#F8F9FA",        // Very light gray background
    backgroundAlt: "#FFFFFF",     // Pure white for cards
    card: "#FFFFFF",              // White cards with shadow
    input: "#F3F4F6",             // Light gray for inputs

    // Text - Good contrast
    text: "#1F2937",              // Dark gray for primary text
    textLight: "#6B7280",         // Medium gray for secondary
    textLighter: "#9CA3AF",       // Light gray for tertiary

    // Borders & Dividers
    border: "#E5E7EB",            // Very light border

    // Primary - Keep the green vibrant
    primary: "#23C16B",
    primaryLight: "#35E086",
    primaryDark: "#1A8B4D",
    accentGreen: "#23C16B",

    // Semantic Colors
    rose: "#FF4D4D",
    roseLight: "#FB7185",
    green: "#23C16B",

    // Neutral Scale (Light Mode Specific)
    neutral900: "#F8F9FA",        // Lightest (background)
    neutral800: "#FFFFFF",        // White (cards)
    neutral700: "#F3F4F6",        // Light gray (inputs/secondary bg)
    neutral600: "#E5E7EB",        // Borders
    neutral500: "#D1D5DB",        // Disabled states
    neutral400: "#9CA3AF",        // Tertiary text
    neutral300: "#6B7280",        // Secondary text
    neutral200: "#4B5563",        // Active text
    neutral100: "#374151",        // Strong text
    neutral50: "#1F2937",         // Darkest (primary text)
    neutral350: "#D1D5DB",        // Special disabled

    // Extended Palette for Light Mode
    white: "#FFFFFF",
    black: "#000000",

    // Special Cards & Components (Soft colors)
    cardSecondary: "#F0FDF4",     // Very light green tint
    cardTertiary: "#EFF6FF",      // Very light blue tint

    // Shadows & Overlays
    shadow: "rgba(0, 0, 0, 0.05)",
    shadowMedium: "rgba(0, 0, 0, 0.1)",
    shadowStrong: "rgba(0, 0, 0, 0.15)",
    overlay: "rgba(0, 0, 0, 0.3)",
  },
};

// ==========================================================
// 👇 SOLUSI ERROR ANDA ADA DI SINI
// ==========================================================
// Kita export 'colors' sebagai alias ke tema 'dark' secara default.
// Ini membuat `import { colors }` di file lama Anda tetap jalan.
export const colors = themes.dark;


// 3. SPACING & RADIUS
export const spacingX = {
  _3: scale(3),
  _5: scale(5),
  _7: scale(7),
  _10: scale(10),
  _12: scale(12),
  _15: scale(15),
  _20: scale(20),
  _25: scale(25),
  _30: scale(30),
  _35: scale(35),
  _40: scale(40),
};

export const spacingY = {
  _5: verticalScale(5),
  _7: verticalScale(7),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _25: verticalScale(25),
  _30: verticalScale(30),
  _35: verticalScale(35),
  _40: verticalScale(40),
  _50: verticalScale(50),
  _60: verticalScale(60),
};

export const radius = {
  _3: verticalScale(3),
  _6: verticalScale(6),
  _10: verticalScale(10),
  _12: verticalScale(12),
  _15: verticalScale(15),
  _17: verticalScale(17),
  _20: verticalScale(20),
  _30: verticalScale(30),
};