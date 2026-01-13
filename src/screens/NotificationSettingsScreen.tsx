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
import BackButton from '@/components/BackButton';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '@/hooks/useNotification';
import { useSnackbar } from '@/hooks/useSnackbar';

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

    // Handle enable toggle
    const handleToggleNotification = async (value: boolean) => {
        if (value && !hasPermission) {
            // Need to request permission first
            const granted = await requestPermission();
            if (!granted) {
                snackbar.error('Permission denied. Please enable in device settings.');
                return;
            }
        }

        await updateSettings({ enabled: value });
        snackbar.success(value ? 'Daily reminder enabled' : 'Daily reminder disabled');
    };

    // Handle test notification
    const handleTestNotification = async () => {
        if (!hasPermission) {
            snackbar.error('Please enable notifications first');
            return;
        }
        await sendTestNotification();
        snackbar.success('Test notification sent!');
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton iconSize={24} />
                    <Typo size={18} fontWeight="700" color={colors.white}>
                        Notification Settings
                    </Typo>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Daily Reminder Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="time" size={20} color={colors.primary} />
                            <Typo size={14} fontWeight="600" color={colors.white} style={{ marginLeft: 8 }}>
                                Daily Expense Reminder
                            </Typo>
                        </View>

                        <Typo size={13} color={colors.neutral400} style={styles.sectionDescription}>
                            Get reminded daily at 7:00 PM to log your expenses
                        </Typo>

                        {/* Enable Toggle */}
                        <View style={styles.settingCard}>
                            <View style={styles.settingRow}>
                                <View style={{ flex: 1 }}>
                                    <Typo size={15} fontWeight="600" color={colors.white}>
                                        Enable Daily Reminder
                                    </Typo>
                                    <Typo size={12} color={colors.neutral400} style={{ marginTop: 2 }}>
                                        Every day at 19:00 (7:00 PM)
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
                                        📝 Jangan Lupa Catat Pengeluaran!
                                    </Typo>
                                    <Typo size={12} color={colors.neutral400} style={{ marginTop: 2 }}>
                                        Sudah catat pengeluaran hari ini?
                                    </Typo>
                                    <Typo size={11} color={colors.neutral500} style={{ marginTop: 4 }}>
                                        19:00 • Every day
                                    </Typo>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Test Notification */}
                    {settings.enabled && (
                        <TouchableOpacity
                            style={styles.testButton}
                            onPress={handleTestNotification}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="send" size={18} color={colors.white} />
                            <Typo size={15} fontWeight="600" color={colors.white} style={{ marginLeft: 8 }}>
                                Send Test Notification
                            </Typo>
                        </TouchableOpacity>
                    )}

                    {/* Info Card */}
                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={24} color={colors.primary} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Typo size={14} fontWeight="600" color={colors.white}>
                                Simple Daily Reminder
                            </Typo>
                            <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                You'll receive a daily notification at 7:00 PM every day to help you remember to log your expenses. Just toggle it on and you're all set!
                            </Typo>
                        </View>
                    </View>

                    {/* Permission Info - Show when not granted */}
                    {!hasPermission && (
                        <View style={styles.warningCard}>
                            <Ionicons name="warning" size={24} color={colors.rose} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Typo size={14} fontWeight="600" color={colors.white}>
                                    Notification Permission Required
                                </Typo>
                                <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                    Enable notifications to receive daily expense reminders. Toggle the switch above to grant permission.
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingVertical: verticalScale(16),
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
