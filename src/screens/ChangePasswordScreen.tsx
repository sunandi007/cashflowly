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
import { useLanguage } from "@/contexts/LanguageContext";
import { useSnackbar } from "@/hooks/useSnackbar";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ChangePasswordScreen() {
    const navigation = useNavigation<Navigation>();
    const { loading } = useAuth();
    const { t } = useLanguage();
    const snackbar = useSnackbar();
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
            snackbar.error(t('changePassword.errors.allFieldsRequired'), t('changePassword.errors.fillAllFields'));
            return;
        }

        if (newPassword.length < 6) {
            snackbar.error(t('changePassword.errors.passwordTooShort'), t('changePassword.errors.minSixCharacters'));
            return;
        }

        if (newPassword !== confirmPassword) {
            snackbar.error(t('changePassword.errors.passwordMismatch'), t('changePassword.errors.passwordsMustMatch'));
            return;
        }

        if (currentPassword === newPassword) {
            snackbar.error(t('changePassword.errors.samePassword'), t('changePassword.errors.newPasswordDifferent'));
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
                throw new Error(t('changePassword.errors.invalidOldPassword'));
            }

            // Jika verifikasi berhasil, update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            snackbar.success(t('changePassword.success.title'), t('changePassword.success.message'));
            navigation.goBack();
        } catch (error: any) {
            console.error("Change Password Error:", error.message);
            snackbar.error(t('changePassword.errors.failedToChange'), error.message);
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
                        {t('changePassword.title')}
                    </Typo>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Form */}
                    <View style={styles.form}>
                        <Typo size={16} fontWeight={"500"} color={colors.textLight}>
                            {t('changePassword.subtitle')}
                        </Typo>

                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Typo size={14} fontWeight={"600"} color={colors.neutral300}>
                                {t('changePassword.currentPassword')}
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder={t('changePassword.placeholders.currentPassword')}
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
                                {t('changePassword.newPassword')}
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder={t('changePassword.placeholders.newPassword')}
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
                                {t('changePassword.confirmPassword')}
                            </Typo>
                            <View style={styles.passwordContainer}>
                                <Input
                                    placeholder={t('changePassword.placeholders.confirmPassword')}
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
                                {t('changePassword.requirements.title')}
                            </Typo>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={newPassword.length >= 6 ? colors.primary : colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    {t('changePassword.requirements.minLength')}
                                </Typo>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color={newPassword === confirmPassword && newPassword.length > 0 ? colors.primary : colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    {t('changePassword.requirements.mustMatch')}
                                </Typo>
                            </View>
                            <View style={styles.requirementItem}>
                                <Ionicons
                                    name="information-circle"
                                    size={16}
                                    color={colors.neutral500}
                                />
                                <Typo size={12} color={colors.neutral400}>
                                    {t('changePassword.requirements.useCombo')}
                                </Typo>
                            </View>
                        </View>

                        <Button loading={isLoading} onPress={handleSubmit}>
                            <Typo fontWeight={"700"} color={colors.black} size={21}>
                                {t('changePassword.button')}
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
