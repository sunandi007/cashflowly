// src/components/FilterDropdown.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import BaseDropdown, { DropdownOption } from "@/components/Dropdown";
import Typo from "@/components/Typo";
import { colors, spacingY } from "@/constant/theme";

type FilterDropdownProps = {
  label?: string;
  data: DropdownOption[];
  value: string | null;
  onChange: (val: string) => void;
  placeholder?: string;
  dropdownStyle?: any;
  iconStyle?: any;
  selectedTextStyle?: any;
};

export default function FilterDropdown({
  label,
  data,
  value,
  onChange,
  placeholder = "Select...",
  dropdownStyle,
  iconStyle,
  selectedTextStyle,
}: FilterDropdownProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Typo size={14} color={colors.neutral400} style={styles.label}>
          {label}
        </Typo>
      )}

      <BaseDropdown
        data={data}
        value={value}
        placeholder={placeholder}
        onChange={(item) => onChange(item.value as string)}
        style={dropdownStyle}
        iconStyle={iconStyle}
        selectedTextStyle={selectedTextStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacingY._15,
  },
  label: {
    marginBottom: spacingY._5,
  },
});
