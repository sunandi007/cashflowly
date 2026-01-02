import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { colors } from "@/constant/theme"; // Asumsi colors memiliki primary dan white

type FilterButtonProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export default function FilterButton({
  label,
  isActive,
  onPress,
}: FilterButtonProps) {
  return (
      <TouchableOpacity
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={onPress}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: "center",
  },
  active: {
    backgroundColor: colors.white,
  },
  inactive: {
    backgroundColor: colors.neutral600,
  },
  text: {
    color: colors.neutral900,
    fontWeight: "600",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.neutral500
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.neutral900,
  },
  activeTab: { backgroundColor: colors.neutral200 },
  activeTabText: { color: colors.neutral800, fontWeight: "bold" },
});
