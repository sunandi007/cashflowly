import React, { useState } from "react";
import { View, Alert, Pressable, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/services/supabaseClient";
import { colors, spacingX, spacingY } from "@/constant/theme";
import { verticalScale } from "@/utils/styling";

import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type AuthMode = "login" | "register";

export default function AuthScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const mode: AuthMode = (route.params as any)?.mode || "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert("Registrasi sukses 🎉", "Cek email untuk verifikasi.");
        setLoading(true);
      }
    } catch (error: any) {
      Alert.alert(isLogin ? "Login gagal" : "Registrasi gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        {/* Heading */}
        <View style={{ gap: 5, marginTop: spacingX._20 }}>
          <Typo size={30} fontWeight={"800"}>
            {isLogin ? "Hey," : "Let's"}
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            {isLogin ? "Welcome Back" : "Get Started"}
          </Typo>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Typo size={16} fontWeight={"500"} color={colors.textLight}>
            {isLogin
              ? "Login now to track all your expenses and income"
              : "Create an account to track all your expenses and income"}
          </Typo>

          <Input placeholder="Enter your Email" onChangeText={setEmail} />
          <Input
            placeholder="Enter your Password"
            secureTextEntry
            onChangeText={setPassword}
          />

          <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
            Forgot Password?
          </Typo>

          <Button loading={loading} onPress={handleSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              {isLogin ? "Login" : "Sign Up"}
            </Typo>
          </Button>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Typo size={15}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Typo>
          <Pressable
            onPress={() =>
              navigation.navigate("Auth", {
                mode: isLogin ? "register" : "login",
              } as never)
            }
          >
            <Typo size={15} fontWeight={"700"} color={colors.primary}>
              {isLogin ? "Sign Up" : "Login"}
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
});
