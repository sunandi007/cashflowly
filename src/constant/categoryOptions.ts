// src/constant/categoryOptions.ts

import { colors } from "./theme"; // Asumsi colors diimpor

// Daftar Ikon Umum dari Ionicons (sesuai tema Money Tracker)
export const ICON_OPTIONS = [
    { label: 'Belanja', value: 'bag-handle-outline' },
    { label: 'Makanan', value: 'fast-food-outline' },
    { label: 'Transportasi', value: 'car-outline' },
    { label: 'Rumah/Sewa', value: 'home-outline' },
    { label: 'Gaji/Kas', value: 'cash-outline' },
    { label: 'Hiburan', value: 'game-controller-outline' },
    { label: 'Kesehatan', value: 'medkit-outline' },
    { label: 'Edukasi', value: 'book-outline' },
    { label: 'Investasi', value: 'analytics-outline' },
    { label: 'Utang', value: 'wallet-outline' },
    { label: 'Lainnya', value: 'ellipsis-horizontal-circle-outline' },
];

// Palet Warna yang Konsisten
export const COLOR_OPTIONS = [
    { label: 'Merah Muda (Rose)', value: colors.rose },
    { label: 'Hijau Utama (Primary)', value: colors.primary },
    { label: 'Jingga', value: '#FFA500' },
    { label: 'Kuning', value: '#FBBF24' },
    { label: 'Biru Cerah', value: '#60A5FA' },
    { label: 'Ungu', value: '#9370DB' },
    { label: 'Biru Tua', value: '#4682B4' },
    { label: 'Abu-abu', value: '#696969' },
];