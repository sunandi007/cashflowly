import Button from "@/components/Button";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constant/theme";
import { verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Navigation>();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* login button and image */}
        <View>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Auth", { mode: "login" })}
          >
            <Typo fontWeight={"500"}>Sign In</Typo>
          </TouchableOpacity>
          <Animated.Image
            entering={FadeIn.duration(1000)}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>

        {/* footer */}
        <View style={styles.footer}>
          <Animated.View
            entering={FadeInDown.duration(1000).springify().damping(12)}
            style={{ alignItems: "center" }}
          >
            <Typo size={30}>Alwais take control</Typo>
            <Typo size={30}>of Your finance</Typo>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(100)
              .springify()
              .damping(12)}
            style={{ alignItems: "center", gap: 2 }}
          >
            <Typo size={17} color={colors.textLight}>
              Finance must be arranged to set a better
            </Typo>
            <Typo size={17} color={colors.textLight}>
              lifestyle in future
            </Typo>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.duration(1000)
              .delay(150)
              .springify()
              .damping(12)}
            style={styles.buttonContainer}
          >
            <Button
              onPress={() => navigation.navigate("Auth", { mode: "register" })}
              style={styles.buttonContainer}
            >
              <Typo size={22} color={colors.neutral900} fontWeight={"600"}>
                Get Started
              </Typo>
            </Button>
          </Animated.View>
        </View>
        {/* footer */}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: spacingY._7,
  },

  welcomeImage: {
    width: "100%",
    height: verticalScale(300),
    alignSelf: "center",
    marginTop: verticalScale(100),
  },

  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  footer: {
    backgroundColor: colors.neutral900,
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    width: "80%",
    height: verticalScale(52),
    borderRadius: verticalScale(10),
    justifyContent: "center",
    alignItems: "center",
  },
});
