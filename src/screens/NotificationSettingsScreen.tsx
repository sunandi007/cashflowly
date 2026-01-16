import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY, radius } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';
import Typo from '@/components/Typo';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/hooks/useNotification';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotificationSettingsScreen() {
    const navigation = useNavigation();
    const {
        settings,
        hasPermission,
        updateSettings,
        requestPermission,
        sendTestNotification,
    } = useNotification();
    const snackbar = useSnackbar();

    const { t } = useLanguage();

    // Handle enable toggle
    const handleToggleNotification = async (value: boolean) => {
        if (value && !hasPermission) {
            // Need to request permission first
            const granted = await requestPermission();
            if (!granted) {
                snackbar.error(t('notifications.permissionDenied'));
                return;
            }
        }

        await updateSettings({ enabled: value });
        snackbar.success(value ? t('notifications.enabled') : t('notifications.disabled'));
    };

    // Handle test notification
    const handleTestNotification = async () => {
        if (!hasPermission) {
            snackbar.error(t('notifications.enableFirst'));
            return;
        }
        await sendTestNotification();
        snackbar.success(t('notifications.testSent'));
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <Header
                    title={t('notifications.title')}
                    showBack
                    style={styles.header}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Typo size={14} fontWeight="600" color={colors.white}>
                                {t('notifications.simpleReminder')}
                            </Typo>
                            <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                {t('notifications.simpleReminderDesc')}
                            </Typo>
                        </View>
                    </View>

                    {/* Daily Reminder Section */}
                    <View style={styles.section}>
                        {/* Enable Toggle */}
                        <View style={styles.settingCard}>
                            <View style={styles.settingRow}>
                                <View style={{ flex: 1 }}>
                                    <Typo size={15} fontWeight="600" color={colors.white}>
                                        {t('notifications.enableDaily')}
                                    </Typo>
                                    <Typo size={12} color={colors.neutral400} style={{ marginTop: 2 }}>
                                        {t('notifications.dailyTime')}
                                    </Typo>
                                </View>
                                <Switch
                                    value={settings.enabled}
                                    onValueChange={handleToggleNotification}
                                    trackColor={{ false: colors.neutral700, true: colors.primary + '80' }}
                                    thumbColor={settings.enabled ? colors.primary : colors.neutral400}
                                />
                            </View>
                        </View>

                        {/* Preview - Show when enabled */}
                        {settings.enabled && (
                            <View style={styles.previewCard}>
                                <View style={styles.previewIcon}>
                                    <Ionicons name="notifications" size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typo size={13} fontWeight="600" color={colors.white}>
                                        {t('notifications.previewTitle')}
                                    </Typo>
                                    <Typo size={12} color={colors.neutral400} style={{ marginTop: 2 }}>
                                        {t('notifications.previewBody')}
                                    </Typo>
                                    <Typo size={11} color={colors.neutral500} style={{ marginTop: 4 }}>
                                        {t('notifications.previewMeta')}
                                    </Typo>
                                </View>
                            </View>
                        )}
                    </View>


                    {/* Permission Info - Show when not granted */}
                    {!hasPermission && (
                        <View style={styles.warningCard}>
                            <Ionicons name="warning" size={24} color={colors.rose} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Typo size={14} fontWeight="600" color={colors.white}>
                                    {t('notifications.permissionRequired')}
                                </Typo>
                                <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                    {t('notifications.permissionDesc')}
                                </Typo>
                            </View>
                        </View>
                    )}

                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: verticalScale(24),
        paddingHorizontal: 0,
        paddingVertical: 0,
        minHeight: 0,
        marginHorizontal: spacingX._15,
    },
    scrollContent: {
        paddingHorizontal: spacingX._20,
        paddingBottom: verticalScale(32),
    },
    section: {
        marginBottom: verticalScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    sectionDescription: {
        marginBottom: verticalScale(16),
        lineHeight: 18,
    },
    settingCard: {
        backgroundColor: colors.neutral800,
        borderRadius: radius._15,
        padding: spacingX._15,
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    previewCard: {
        flexDirection: 'row',
        backgroundColor: colors.neutral700,
        borderRadius: radius._12,
        padding: spacingX._12,
        borderWidth: 1,
        borderColor: colors.primary + '40',
    },
    previewIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: colors.primary + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: verticalScale(14),
        borderRadius: radius._12,
        marginBottom: verticalScale(16),
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.primary + '15',
        borderRadius: radius._12,
        padding: spacingX._12,
        borderWidth: 1,
        borderColor: colors.primary + '30',
        marginBottom: verticalScale(12),
    },
    warningCard: {
        flexDirection: 'row',
        backgroundColor: colors.rose + '15',
        borderRadius: radius._12,
        padding: spacingX._12,
        borderWidth: 1,
        borderColor: colors.rose + '30',
    },
});
