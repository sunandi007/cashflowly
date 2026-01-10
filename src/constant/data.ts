import { AccountOptionType } from "@/types/model";
import { colors } from "./theme";

// Group 1: Account & Management
export const accountOptionsGroup1: AccountOptionType[] = [
  {
    title: "Recurring Billing",
    icon: "wallet",
    bgColor: colors.primary + '30', // Purple
  },
  {
    title: "Manage Categories",
    icon: "pricetag",
    bgColor: colors.primary + '30', // Green
  },
  {
    title: "Manage Tags",
    icon: "pricetags",
    bgColor: colors.primary + '30', // Sky Blue
  },
  {
    title: "Data Management",
    icon: "cloud-download-outline",
    bgColor: colors.primary + '30',
  },
];

// Group 2: Settings & Support
export const accountOptionsGroup2: AccountOptionType[] = [
  {
    title: "Settings",
    icon: "settings-outline",
    bgColor: colors.primary + '30',
  },
  {
    title: "Notifications",
    icon: "notifications",
    bgColor: colors.primary + '30', // Amber
    badge: 2,
  },
  {
    title: "Help & Support",
    icon: "help-circle",
    bgColor: colors.primary + '30', // Pink
  },
];