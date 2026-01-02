import { scale, verticalScale } from "@/utils/styling";

export const colors = {
  // Background - Dark Forest Green
  background: "#0C1A14",     // Latar belakang paling dasar (sangat gelap)
  backgroundAlt: "#14261F",  // Permukaan sedikit lebih terang

  // Primary/Accent - Emerald Green
  primary: "#23C16B",        // Hijau cerah pada tombol 'Dinner'
  primaryLight: "#35E086",   // Hover/Highlight
  primaryDark: "#1A8B4D",    // Tekan/Active
  accentGreen: "#23C16B",    // Sama dengan primary (untuk konsistensi)

  // Text colors
  text: "#FFFFFF",           // Putih murni untuk angka saldo
  textLight: "#A9B3AD",      // Abu-abu kehijauan untuk label (Category, Wallet)
  textLighter: "#7C8A82",    // Deskripsi kecil
  white: "#FFFFFF",
  black: "#000000",

  // Semantic colors
  rose: "#FF4D4D",           // Tetap merah untuk indikator pengeluaran jika perlu
  green: "#23C16B",
  roseLight: "#FB7185",

  // Neutral scale - Deep Forest/Olive Tones (Bukan Slate/Blue)
  neutral50: "#F2F4F3",
  neutral100: "#E6E9E7",
  neutral200: "#e5e5e5",
  neutral300: "#d4d4d4",
  neutral350: "#CCCCCC",
  neutral400: "#94a3b8",
  neutral500: "#64748b",
  neutral600: "#475569",
  neutral700: "#1A2E26",     // Background Card (Food & Dining, Wallet)
  neutral800: "#14261F",     // Input field/Note background
  neutral900: "#0C1A14",     // Base background
};

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
