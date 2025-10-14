import { colors, radius } from "@/constant/theme";
import { CustomButtonProps } from "@/types/model";
import { verticalScale } from "@/utils/styling";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Button = ({
  style,
  onPress,
  loading = false,
  children,
}: CustomButtonProps) => {
  if (loading) {
    return (
      <View style={[style, styles.button, { backgroundColor: "transparent" }]}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      disabled={loading}
    >
      {children}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius._17,
        borderCurve: "continuous",
        height: verticalScale(52),
        justifyContent: "center",
        alignItems: "center",
      }
});
