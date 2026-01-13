import React, { useState } from "react";
import { View, StyleSheet, Alert, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/types/navigation";
import { colors, spacingX, spacingY } from "@/constant/theme";

import ScreenWrapper from "@/components/ScreenWrapper";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<Navigation>();
    const { forgotPassword, loading } = useAuth();
    const { t } = useLanguage();
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert(
                t('forgotPassword.errors.emailRequired'),
                t('forgotPassword.errors.emailRequiredMessage')
            );
            return;
        }

        const result = await forgotPassword(email);
        if (result.success) {
            Alert.alert(
                t('forgotPassword.success.emailSent'),
                t('forgotPassword.success.emailSentMessage'),
                [
                    {
                        text: t('forgotPassword.success.ok'),
                        onPress: () => navigation.goBack(),
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
                        {t('forgotPassword.heading.line1')}
                    </Typo>
                    <Typo size={30} fontWeight={"800"}>
                        {t('forgotPassword.heading.line2')}
                    </Typo>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Typo size={16} fontWeight={"500"} color={colors.textLight}>
                        {t('forgotPassword.subtitle')}
                    </Typo>

                    <Input
                        placeholder={t('forgotPassword.placeholder')}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Button loading={loading} onPress={handleSubmit}>
                        <Typo fontWeight={"700"} color={colors.black} size={21}>
                            {t('forgotPassword.button')}
                        </Typo>
                    </Button>
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Typo size={14} color={colors.neutral400} style={{ textAlign: "center" }}>
                        {t('forgotPassword.rememberPassword')}{" "}
                    </Typo>
                    <Pressable
                        onPress={() => navigation.goBack()}
                    >
                        <Typo
                            size={14}
                            fontWeight={"700"}
                            color={colors.primary}
                        >
                            {t('forgotPassword.backToLogin')}
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
    info: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
    },
});
