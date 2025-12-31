import { AccountOptionType } from "@/types/model";
import { colors } from "./theme";

// Group 1: Account & Management
export const accountOptionsGroup1: AccountOptionType[] = [
  {
    title: "Wallets",
    icon: "wallet",
    bgColor: "#8B5CF6", // Purple
  },
  {
    title: "Manage Categories",
    icon: "pricetag",
    bgColor: colors.primary, // Green
  },
];

// Group 2: Settings & Support
export const accountOptionsGroup2: AccountOptionType[] = [
  {
    title: "Notifications",
    icon: "notifications",
    bgColor: "#F59E0B", // Amber
    badge: 2,
  },
  {
    title: "Security & Password",
    icon: "lock-closed",
    bgColor: colors.neutral600, // Gray
  },
  {
    title: "Help & Support",
    icon: "help-circle",
    bgColor: "#EC4899", // Pink
  },
];

// Legacy export for backward compatibility
export const accountOptions: AccountOptionType[] = [
  {
    title: "Edit Profile",
    icon: "person-circle-outline",
    bgColor: "#6366f1",
  },
  {
    title: "Settings",
    icon: "settings-outline",
    bgColor: "#069669",
  },
  {
    title: "Kustomisasi Kategori",
    icon: "folder-open-outline",
    bgColor: "#d8521dff",
  },
  {
    title: "Tagihan Berulang",
    icon: "folder-open-outline",
    bgColor: "#cfec67ff",
  },
  {
    title: "Privacy Policey",
    icon: "shield-checkmark-outline",
    bgColor: colors.neutral600,
  },
  {
    title: "Logout",
    icon: "log-out-outline",
    bgColor: "#e11d48",
  },
];