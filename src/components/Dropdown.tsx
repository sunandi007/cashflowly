import React from "react";
import { StyleSheet, ViewStyle, TextStyle, View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

export interface DropdownOption {
  label: string;
  value: string;
  id?: string;
  icon?: string;
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
  containerStyle,
  disabled = false,
}) => {
  const renderItem = (item: DropdownOption) => {
    const isSelected = item.value === value;
    return (
      <View style={[styles.item, isSelected && styles.itemSelected]}>
        {item.icon && (
          <Ionicons
            name={item.icon as any}
            size={20}
            color={isSelected ? colors.white : colors.neutral400} // Icon selected is white on green bg
            style={styles.icon}
          />
        )}
        <Text style={[styles.textItem, isSelected && styles.textItemSelected]}>
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={20} color={colors.white} />
        )}
      </View>
    );
  };

  return (
    <Dropdown
      style={[styles.dropdownContainer, style]}
      placeholderStyle={[styles.dropdownPlaceholder, placeholderStyle]}
      selectedTextStyle={[styles.dropdownSelectedText, selectedTextStyle]}
      containerStyle={[styles.dropdownListContainer, containerStyle]}
      // activeColor removed in favor of custom renderItem styling
      activeColor={colors.neutral900}
      itemContainerStyle={{ backgroundColor: colors.neutral900 }}
      iconStyle={styles.dropdownIcon}
      data={data}
      maxHeight={maxHeight}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disable={disabled}
      renderItem={renderItem}
      autoScroll={false} // Prevent auto scroll issues with custom items
    />
  );
};

export default BaseDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    height: 50,
    borderColor: colors.neutral700,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  dropdownPlaceholder: {
    color: colors.neutral500,
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: colors.white,
    fontWeight: "500",
    fontSize: 14,
  },
  dropdownListContainer: {
    backgroundColor: colors.neutral900,
    borderColor: colors.neutral800,
    borderWidth: 1,
    borderRadius: 16,
    padding: 8, // Add padding to container for floating effect
    shadowColor: "#000", // Shadow for elevation
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dropdownIcon: {
    tintColor: colors.neutral500,
    width: 20,
    height: 20,
  },
  // Custom Render Item Styles
  item: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.neutral900,
  },
  itemSelected: {
    backgroundColor: colors.primary,
  },
  textItem: {
    flex: 1,
    fontSize: 14,
    color: colors.neutral400,
    fontWeight: "500",
  },
  textItemSelected: {
    color: colors.white,
    fontWeight: "700",
  },
  icon: {
    marginRight: 10,
  },
});
