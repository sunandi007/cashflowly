import { HeaderProps } from "@/types/model";
import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import Typo from "./Typo";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacingX } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";

const Header = ({
  title = "",
  titleSize,
  subtitle,
  leftIcon, // Legacy
  rightIcon, // Legacy
  style,

  showBack = false,
  showClose = false,
  onBack,
  onClose,

  leftComponent,
  rightComponent,
  centerComponent,

  children
}: HeaderProps) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  // Determine Left Element
  const renderLeft = () => {
    if (leftComponent) return leftComponent;
    if (showBack) {
      return (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={scale(24)} color={colors.white} />
        </TouchableOpacity>
      );
    }
    if (leftIcon) return leftIcon; // Legacy support

    // Placeholder to maintain spacing if centered title is desired but no left item
    return <View style={styles.placeholder} />;
  };

  // Determine Right Element
  const renderRight = () => {
    if (rightComponent) return rightComponent;
    if (showClose) {
      return (
        <TouchableOpacity
          onPress={handleClose}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {/* <Ionicons name="close" size={scale(24)} color={colors.white} /> */}
          <TouchableOpacity style={styles.closeBtnCircle} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.neutral400} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
    if (rightIcon) return rightIcon; // Legacy

    return <View style={styles.placeholder} />;
  };

  // Determine Center Element
  const renderCenter = () => {
    if (centerComponent) return centerComponent;

    return (
      <View style={styles.titleContainer}>
        {title && (
          <Typo
            size={titleSize ?? 22}
            fontWeight="600"
            style={styles.titleText}
            textProps={{ numberOfLines: 1 }}
          >
            {title}
          </Typo>
        )}
        {subtitle && (
          <Typo
            size={14}
            color={colors.neutral400}
            style={styles.subtitleText}
            textProps={{ numberOfLines: 1 }}
          >
            {subtitle}
          </Typo>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {children ? (
        children
      ) : (
        <>
          <View style={styles.sideContainer}>
            {renderLeft()}
          </View>

          {renderCenter()}

          <View style={[styles.sideContainer, { alignItems: 'flex-end' }]}>
            {renderRight()}
          </View>
        </>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacingX._20,
    paddingVertical: verticalScale(14),
    minHeight: verticalScale(56),
  },
  sideContainer: {
    minWidth: scale(40),
    justifyContent: "center",
  },
  iconButton: {
    padding: scale(4),
  },
  closeBtnCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.neutral800,
    justifyContent: 'center', alignItems: 'center'
  },
  placeholder: {
    width: scale(24),
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacingX._10,
  },
  titleText: {
    textAlign: "center",
    color: colors.white,
  },
  subtitleText: {
    textAlign: 'center',
    marginTop: verticalScale(2),
  }
});
