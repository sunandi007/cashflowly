import { HeaderProps } from "@/types/model";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typo from "./Typo";

const Header = ({ title = "", leftIcon, rightIcon, style }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      {/* Left icon */}
      <View style={styles.sideContainer}>
        {leftIcon ? leftIcon : <View style={styles.placeholder} />}
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        {title && (
          <Typo size={22} fontWeight="600" style={styles.titleText}>
            {title}
          </Typo>
        )}
      </View>

      {/* Right icon */}
      <View style={styles.sideContainer}>
        {rightIcon ? rightIcon : <View style={styles.placeholder} />}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 56,
  },
  sideContainer: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    textAlign: "center",
  },
});
