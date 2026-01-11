import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import type { ScreenWrapperProps } from "@/types/model";

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      {children}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
