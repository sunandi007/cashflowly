import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { Ionicons } from "@expo/vector-icons";

import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/services/supabaseClient";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
    const navigation = useNavigation<Navigation>();
    const { loading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        // Validasi
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            Alert.alert("Password Diperlukan", "Silakan isi semua field password.");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Password Terlalu Pendek", "Password baru harus minimal 6 karakter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Password Tidak Cocok", "Password baru dan konfirmasi password harus sama.");
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert("Password Sama", "Password baru tidak boleh sama dengan password lama.");
            return;
        }

        setIsLoading(true);

        try {
            // Pertama, verifikasi password lama dengan sign in
            const { data: userData } = await supabase.auth.getUser();
            const userEmail = userData?.user?.email;

            if (!userEmail) {
                throw new Error("Email user tidak ditemukan");
            }

            // Verifikasi password lama
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password: currentPassword,
            });

            if (signInError) {
                throw new Error("Password lama tidak valid");
            }

            // Jika verifikasi berhasil, update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            Alert.alert(
                "Berhasil! 🎉",
                "Password Anda telah berhasil diubah.",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error("Change Password Error:", error.message);
            Alert.alert("Gagal Mengubah Password", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <BackButton iconSize={28} />

                {/* Heading */}
                <View style={{ gap: 5, marginTop: spacingX._20 }}>
                    <Typo size={30} fontWeight={"800"}>
                        Ubah Password
                    </Typo>
                    <Typo size={30} fontWeight={"800"}>
                        Anda
                    </Typo>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Form */}
                    <View style={styles.form}>
                        <Typo size={16} fontWeight={"500"} color={colors.textLight}>
                            Masukkan password lama dan password baru Anda
                        </Typo>

                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Typo size={14} fontWeight={"600"} color={colors.neutral300}>
                                Password Lama
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder="Masukkan password lama"
                                    secureTextEntry={!isCurrentPasswordVisible}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                                    style={styles.eyeIcon}
                                >
                                    <Ionicons
                                        name={isCurrentPasswordVisible ? "eye" : "eye-off"}
                                        size={24}
                                        color={colors.textLight}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Typo size={14} fontWeight={"600"} color={colors.neutral300}>
                                Password Baru
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder="Masukkan password baru"
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
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Typo size={14} fontWeight={"600"} color={colors.neutral300}>
                                Konfirmasi Password Baru
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder="Konfirmasi password baru"
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
                        </View>

                        {/* Password Requirements */}
                        <View style={styles.requirementsContainer}>
                            <Typo size={13} fontWeight={"600"} color={colors.neutral400}>
                                Persyaratan Password:
                            </Typo>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={newPassword.length >= 6 ? colors.primary : colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    Minimal 6 karakter
                                </Typo>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={newPassword === confirmPassword && newPassword.length > 0 ? colors.primary : colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    Password dan konfirmasi cocok
                                </Typo>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="information-circle"
                                    size={16}
                                    color={colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    Gunakan kombinasi huruf dan angka untuk keamanan lebih baik
                                </Typo>
                            </View>
                        </View>

                        <Button loading={isLoading} onPress={handleSubmit}>
                            <Typo fontWeight={"700"} color={colors.black} size={21}>
                                Ubah Password
                            </Typo>
                        </Button>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingX._20,
    },
    scrollContent: {
        paddingBottom: spacingY._30,
    },
    form: {
        gap: spacingY._20,
        marginTop: spacingY._20,
    },
    inputGroup: {
        gap: spacingY._10,
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
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        backgroundColor: colors.neutral800,
        borderRadius: radius._15,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});
