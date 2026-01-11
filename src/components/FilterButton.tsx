import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radius } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";

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
      style={[styles.tabButton, isActive && styles.tabButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: "center",
    borderRadius: radius._30,
    backgroundColor: "transparent",
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: scale(14),
    fontWeight: "600",
    color: colors.neutral400,
  },
  tabTextActive: {
    color: colors.neutral900,
  },
});
