import ScreenWrapper from "@/components/ScreenWrapper";
import Header from "@/components/Header";
import Typo from "@/components/Typo";
import { colors, radius, spacingX } from "@/constant/theme";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { scale, verticalScale } from "@/utils/styling";
import Animated, { FadeInDown } from "react-native-reanimated";

const PrivacyPolicyScreen = () => {
    const { t } = useLanguage();

    // Get sections from translation
    const sections = t('privacyPolicy.sections', { returnObjects: true }) as any as Array<{ title: string; content: string }>;

    return (
        <ScreenWrapper>
            <Header title={t('privacyPolicy.title')} showBack />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeInDown.delay(100).springify().damping(20)}>
                    <Typo size={14} color={colors.neutral400} style={styles.lastUpdated}>
                        {t('privacyPolicy.lastUpdated')}
                    </Typo>

                    <Typo size={16} color={colors.neutral200} style={styles.intro} fontWeight="400">
                        {t('privacyPolicy.intro')}
                    </Typo>

                    <View style={styles.divider} />

                    {Array.isArray(sections) && sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Typo size={18} fontWeight="700" color={colors.white} style={styles.sectionTitle}>
                                {section.title}
                            </Typo>
                            <Typo size={15} color={colors.neutral300} style={styles.sectionContent} fontWeight="400">
                                {section.content}
                            </Typo>
                        </View>
                    ))}
                </Animated.View>
            </ScrollView>
        </ScreenWrapper>
    );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: spacingX._20,
        paddingBottom: verticalScale(40),
        paddingTop: verticalScale(10),
    },
    lastUpdated: {
        marginBottom: verticalScale(20),
        fontStyle: 'italic',
    },
    intro: {
        lineHeight: scale(24),
        marginBottom: verticalScale(20),
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral700,
        marginBottom: verticalScale(20),
    },
    section: {
        marginBottom: verticalScale(24),
    },
    sectionTitle: {
        marginBottom: verticalScale(8),
    },
    sectionContent: {
        lineHeight: scale(22),
    },
});
