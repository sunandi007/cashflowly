import React, { useState } from "react";
import { View, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/services/supabaseClient";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { verticalScale } from "@/utils/styling";

import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useWallets } from "@/hooks/useWallets";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useAlert } from "@/hooks/useAlert";
import { useSnackbar } from "@/hooks/useSnackbar";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type AuthMode = "login" | "register";

export default function AuthScreen() {
  const queryClient = useQueryClient();

  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const mode: AuthMode = (route.params as any)?.mode || "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signInWithGoogle, checkEmailExists, loading: authLoading } = useAuth();

  const { wallets, addWallet, isLoading } = useWallets();
  const alert = useAlert();
  const snack = useSnackbar();

  const isLogin = mode === "login";

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Sesi akan diperbarui secara otomatis oleh listener di RootNavigation,
      // jadi tidak perlu setLoading(false) di sini.
    } catch (error: any) {
      snack.error("Login Gagal", error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation: Check if email or password is empty
    if (!email.trim() || !password.trim()) {
      snack.error(
        "Validasi Gagal",
        "Email dan password harus diisi"
      );
      return;
    }

    // Validation: Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      snack.error(
        "Format Email Salah",
        "Masukkan alamat email yang valid"
      );
      return;
    }

    // Validation: Check if password has minimum 6 characters
    if (password.length < 6) {
      snack.error(
        "Password Terlalu Pendek",
        "Password minimal 6 karakter"
      );
      return;
    }

    // Validation: Check if email already exists (only for registration)
    if (!isLogin) {
      const emailExists = await checkEmailExists(email.trim());
      if (emailExists) {
        snack.error(
          "Email Sudah Terdaftar",
          "Email ini sudah digunakan. Silakan login atau gunakan email lain."
        );
        return;
      }
    }

    try {
      setLoading(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password, options: {
            emailRedirectTo: 'https://jade-lokum-b3177e.netlify.app/'
          }
        });
        if (error) throw error;
        snack.success("Registrasi sukses 🎉", "Cek email untuk verifikasi.");
        setLoading(true);
      }
    } catch (error: any) {
      if (!isLogin && error.message) {
        snack.error("Registrasi gagal", error.message);
      } else {
        snack.error(isLogin ? "Login gagal" : "Registrasi gagal", error.message);
      }
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
          <View style={styles.passwordContainer}>
            <Input
              placeholder="Enter your Password"
              // Jika visible true, secureTextEntry false (teks terlihat), dan sebaliknya
              secureTextEntry={!isPasswordVisible}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={24}
                color={colors.textLight}
              />
            </TouchableOpacity>
          </View>

          <Pressable onPress={() => navigation.navigate("ForgotPassword" as never)}>
            <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
              Forgot Password?
            </Typo>
          </Pressable>

          <Button loading={loading} onPress={handleSubmit}>
            <Typo fontWeight={"700"} color={colors.black} size={21}>
              {isLogin ? "Login" : "Sign Up"}
            </Typo>
          </Button>

          {/* <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Typo color={colors.neutral400}>ATAU</Typo>
            <View style={styles.divider} />
          </View> */}

          {/* <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading} // Nonaktifkan jika sedang loading
          >
            <Ionicons name="logo-google" size={24} color={colors.white} />
            <Typo style={styles.googleButtonText} fontWeight="600">
              Lanjutkan dengan Google
            </Typo>
          </TouchableOpacity> */}
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
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    // Menyesuaikan tinggi agar pas di tengah vertikal, sesuaikan jika perlu
    alignSelf: 'center',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingX._15,
    marginTop: spacingY._20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral600,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',  // Outline style
    borderWidth: 1,
    borderColor: colors.neutral400,
    paddingVertical: spacingY._15,
    borderRadius: 16,  // Per design spec
    marginTop: spacingY._20,
    gap: spacingX._10,
  },
  googleButtonText: {
    color: colors.white,  // White text for dark mode
    fontSize: 16,
  }
});

async function createDefaultWalletIfNeeded(userId: string) {
  // Cek apakah sudah ada wallet
  const { data: existingWallets, error: fetchError } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", userId);

  if (fetchError) throw fetchError;

  // Kalau belum ada, buat wallet baru
  if (!existingWallets || existingWallets.length === 0) {
    const { error: insertError } = await supabase.from("wallets").insert([
      {
        user_id: userId,
        name: "Main Wallet",
        balance: 0,
        icon: "wallet-outline",
      },
    ]);
    if (insertError) throw insertError;
  }
}
