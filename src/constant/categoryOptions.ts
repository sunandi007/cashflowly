// src/constant/categoryOptions.ts

import { colors } from "./theme";

// Icon options matching the reference design (Ionicons names)
export const CATEGORY_ICONS = [
    // Row 1 - Shopping, Food, Transport, Home
    { label: "Belanja", value: "bag-handle" },
    { label: "Makanan", value: "restaurant" },
    { label: "Transportasi", value: "car" },
    { label: "Rumah", value: "home" },

    // Row 2 - Travel, Pets, Camera, Savings
    { label: "Perjalanan", value: "airplane" },
    { label: "Hewan", value: "paw" },
    { label: "Kamera", value: "camera" },
    { label: "Tabungan", value: "wallet" },

    // Row 3 - Medical, Clothes, Work, Fitness
    { label: "Kesehatan", value: "shield-checkmark" },
    { label: "Pakaian", value: "shirt" },
    { label: "Kerja", value: "briefcase" },
    { label: "Fitness", value: "barbell" },
];

// Color palette matching the reference design - vibrant colors
export const CATEGORY_COLORS = [
    colors.primary,  // Green (Primary)
    "#3B82F6",       // Blue
    "#EF4444",       // Red
    "#F59E0B",       // Yellow/Amber
    "#A855F7",       // Purple
];

// Legacy exports for backward compatibility
export const ICON_OPTIONS = CATEGORY_ICONS;
export const COLOR_OPTIONS = CATEGORY_COLORS.map((color) => ({
    label: color,
    value: color,
}));