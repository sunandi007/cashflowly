import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import { colors, spacingX, spacingY } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/hooks/useAuth";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ResetPasswordScreen() {
    const navigation = useNavigation<Navigation>();
    const { resetPassword, loading } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const handleSubmit = async () => {
        // Validasi
        if (!newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert("Password Diperlukan", "Silakan isi semua field password.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Password Terlalu Pendek", "Password harus minimal 6 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Password Tidak Cocok", "Password dan konfirmasi password harus sama.");
            return;
        }

        const result = await resetPassword(newPassword);
        if (result.success) {
            Alert.alert(
                "Password Berhasil Direset! 🎉",
                "Password Anda telah berhasil diperbarui. Silakan login dengan password baru.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // Navigate to login screen
                            navigation.navigate("Auth", { mode: "login" } as never);
                        },
                    },
                ]
            );
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />

                {/* Heading */}
                <View style={{ gap: 5, marginTop: spacingX._20 }}>
                    <Typo size={30} fontWeight={"800"}>
                        Reset Password
                    </Typo>
                    <Typo size={30} fontWeight={"800"}>
                        Anda
                    </Typo>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Typo size={16} fontWeight={"500"} color={colors.textLight}>
                        Silakan masukkan password baru Anda
                    </Typo>

                    {/* New Password */}
                    <View style={styles.passwordContainer}>
                        <Input
                            placeholder="Password Baru"
                            secureTextEntry={!isNewPasswordVisible}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={isNewPasswordVisible ? "eye" : "eye-off"}
                                size={24}
                                color={colors.textLight}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.passwordContainer}>
                        <Input
                            placeholder="Konfirmasi Password Baru"
                            secureTextEntry={!isConfirmPasswordVisible}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Ionicons
                                name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                                size={24}
                                color={colors.textLight}
                            />
                        </TouchableOpacity>
                    </View>

                    <Button loading={loading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} color={colors.black} size={21}>
                            Reset Password
                        </Typo>
                    </Button>

                    {/* Password Requirements */}
                    <View style={styles.requirementsContainer}>
                        <Typo size={12} color={colors.neutral400}>
                            • Password minimal 6 karakter
                        </Typo>
                        <Typo size={12} color={colors.neutral400}>
                            • Gunakan kombinasi huruf dan angka untuk keamanan lebih baik
                        </Typo>
                    </View>
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
        alignSelf: 'center',
    },
    requirementsContainer: {
        gap: 8,
        paddingTop: 10,
    },
});
