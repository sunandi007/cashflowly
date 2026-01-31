import { scale, verticalScale } from "@/utils/styling";

// 1. PALETTE (WhatsApp Style)
const palette = {
  // --- USER REQUESTED COLORS ---
  tealDark: "#075e54",    // (7,94,84) - Header/Primary Dark
  teal: "#128c7e",        // (18,140,126) - Secondary/Accent
  greenBright: "#25d366", // (37,211,102) - FAB/Success/Checkmarks
  greenPale: "#dcf8c6",   // (220,248,198) - Income BG/Chat Bubble
  beige: "#ece5dd",       // (236,229,221) - Light Mode Background

  // --- OFFICIAL WA DARK MODE COLORS (Complementary) ---
  waDarkBg: "#0b141a",    // Very dark blue-ish gray (Background)
  waDarkCard: "#202c33",  // Dark gray (Card Surface)
  waDarkInput: "#2a3942", // Slightly lighter (Input)

  // Commons
  white: "#FFFFFF",
  black: "#000000",
  rose: "#ef5350",        // Red for expense (Material Red)

  // Text
  textDark: "#111b21",    // Black-ish for Light Mode
  textLight: "#e9edef",   // White-ish for Dark Mode
  textGrey: "#8696a0",    // Muted text
};

// 2. THEMES (Logic Mapping)
export const themes = {
  // 🌑 DARK MODE (WhatsApp Dark Style)
  dark: {
    mode: 'dark',

    // Background & Surfaces
    background: palette.waDarkBg,   // #0b141a
    backgroundAlt: palette.waDarkCard,
    card: palette.waDarkCard,       // #202c33
    input: palette.waDarkInput,     // #2a3942

    // Text
    text: palette.textLight,        // #e9edef
    textLight: palette.textGrey,    // #8696a0
    textLighter: "#536773",

    // Borders
    border: palette.waDarkInput,

    // Primary - Menggunakan Bright Green (#25d366) agar kontras di gelap
    primary: palette.greenBright,
    primaryLight: "#4ce283",        // Slightly lighter green
    primaryDark: palette.teal,      // Darker teal for gradients/shadows
    accentGreen: palette.greenBright,

    // Semantic Colors
    rose: palette.rose,
    roseLight: "#ff867c",
    green: palette.greenBright,

    // Neutral Scale (Adapted for Dark)
    neutral900: palette.waDarkBg,
    neutral800: palette.waDarkCard,
    neutral700: palette.waDarkInput,
    neutral600: "#374248",
    neutral500: palette.textGrey,
    neutral400: "#536773",
    neutral300: palette.textGrey,
    neutral200: palette.textLight,
    neutral100: palette.white,
    neutral50: palette.white,
    neutral350: "#374248",

    white: palette.white,
    black: palette.black,
    cardSecondary: palette.waDarkInput,
    cardTertiary: palette.waDarkBg,

    // Shadows
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowMedium: "rgba(0, 0, 0, 0.5)",
    shadowStrong: "rgba(0, 0, 0, 0.8)",
    overlay: "rgba(0, 0, 0, 0.8)",
  },

  // ☀️ LIGHT MODE (Classic WhatsApp Style)
  light: {
    mode: 'light',

    // Background & Surfaces
    background: palette.beige,      // #ece5dd (Khas WhatsApp)
    backgroundAlt: palette.white,
    card: palette.white,            // Kartu Putih di atas Beige
    input: "#f0f2f5",               // Light gray input

    // Text
    text: palette.textDark,         // #111b21
    textLight: palette.textGrey,    // #8696a0
    textLighter: "#d1d7db",

    // Borders
    border: "#e2e4e6",

    // Primary - Menggunakan Teal (#075e54) khas Header WA
    primary: palette.tealDark,
    primaryLight: palette.teal,     // #128c7e
    primaryDark: "#054c44",
    accentGreen: palette.greenBright, // Tetap gunakan hijau terang untuk FAB

    // Semantic Colors
    rose: "#d32f2f",
    roseLight: "#ff6659",
    green: palette.teal,            // Text hijau menggunakan Teal agar mudah dibaca

    // Neutral Scale
    neutral900: palette.beige,
    neutral800: palette.white,
    neutral700: "#f0f2f5",
    neutral600: "#e2e4e6",
    neutral500: "#8696a0",
    neutral400: "#667781",
    neutral300: "#41525d",
    neutral200: "#111b21",
    neutral100: "#0b141a",
    neutral50: "#000000",
    neutral350: "#e2e4e6",

    white: palette.white,
    black: palette.black,
    cardSecondary: palette.greenPale, // #dcf8c6 (Kartu Income/Special)
    cardTertiary: "#ffffff",

    // Shadows
    shadow: "rgba(0, 0, 0, 0.05)",
    shadowMedium: "rgba(0, 0, 0, 0.1)",
    shadowStrong: "rgba(0, 0, 0, 0.15)",
    overlay: "rgba(0, 0, 0, 0.4)",
  },
};

// ==========================================================
// DEFAULT EXPORT (Gunakan Dark Mode WA sebagai default)
// ==========================================================
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