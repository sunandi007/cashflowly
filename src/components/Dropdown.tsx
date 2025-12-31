import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "@/constant/theme";

export interface DropdownOption {
  label: string;
  value: string;
  id?: string;
}

interface BaseDropdownProps {
  data: DropdownOption[];
  value: string | null;
  placeholder?: string;
  onChange: (item: DropdownOption) => void;
  maxHeight?: number;
  style?: ViewStyle;
  placeholderStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  itemTextStyle?: TextStyle;
  containerStyle?: ViewStyle;
  itemContainerStyle?: ViewStyle;
  disabled?: boolean;
}

const BaseDropdown: React.FC<BaseDropdownProps> = ({
  data,
  value,
  placeholder = "Select an option",
  onChange,
  maxHeight = 300,
  style,
  placeholderStyle,
  selectedTextStyle,
  itemTextStyle,
  containerStyle,
  itemContainerStyle,
  disabled = false,
}) => {
  return (
    <Dropdown
      style={[styles.dropdownContainer, style]}
      placeholderStyle={[styles.dropdownPlaceholder, placeholderStyle]}
      selectedTextStyle={[styles.dropdownSelectedText, selectedTextStyle]}
      itemTextStyle={[styles.dropdownItemText, itemTextStyle]}
      itemContainerStyle={[styles.dropdownItemContainer, itemContainerStyle]}
      containerStyle={[styles.dropdownListContainer, containerStyle]}
      activeColor={colors.neutral100}
      iconStyle={styles.dropdownIcon}
      data={data}
      maxHeight={maxHeight}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={placeholder}
      searchPlaceholderTextColor={colors.green}
      onChange={onChange}
      disable={disabled}
    />
  );
};

export default BaseDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    height: 50,
    borderColor: colors.neutral300,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  dropdownPlaceholder: {
    color: colors.neutral500,
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: colors.neutral200,
    fontWeight: "500",
    fontSize: 14,
  },
  dropdownItemText: {
    color: colors.black,
  },
  dropdownItemContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  dropdownListContainer: {
    backgroundColor: colors.white,
    borderColor: colors.neutral300,
    borderRadius: 10,
  },
  dropdownIcon: {
    tintColor: colors.neutral500,
    width: 25,
    height: 25,
  },
});
