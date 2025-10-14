import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { colors } from "@/constant/theme";
import type { ScreenWrapperProps } from "@/types/model";

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  return (
    <View style={[styles.container, style]}>
      <StatusBar backgroundColor={colors.neutral900} barStyle="light-content" />
      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
});
