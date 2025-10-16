import { AccountOptionType } from "@/types/model";
import { colors } from "./theme";

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