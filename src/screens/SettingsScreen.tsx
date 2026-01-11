import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import Typo from '@/components/Typo';
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import BackButton from '@/components/BackButton';
import ScreenWrapper from '@/components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '@/utils/styling';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency, CURRENCIES, CurrencyCode } from '@/contexts/CurrencyContext';
import OptionSelectorModal, { Option } from '@/components/OptionSelectorModal';


type Navigation = NativeStackNavigationProp<RootStackParamList>;

// Theme Options
const THEME_OPTIONS: Option[] = [
    {
        value: 'dark',
        label: 'Dark Mode',
        description: 'Tema gelap untuk mata yang nyaman',
        icon: 'moon'
    },
    {
        value: 'light',
        label: 'Light Mode',
        description: 'Tema terang dan cerah',
        icon: 'sunny'
    },
    {
        value: 'system',
        label: 'System Default',
        description: 'Ikuti pengaturan sistem',
        icon: 'phone-portrait'
    },
];

// Currency Options  
const CURRENCY_OPTIONS: Option[] = [
    {
        value: 'IDR',
        label: 'Indonesian Rupiah',
        description: 'Rp - Indonesia',
        icon: 'cash'
    },
    {
        value: 'USD',
        label: 'US Dollar',
        description: '$ - United States',
        icon: 'cash'
    },
    {
        value: 'EUR',
        label: 'Euro',
        description: '€ - European Union',
        icon: 'cash'
    },
    {
        value: 'SGD',
        label: 'Singapore Dollar',
        description: 'S$ - Singapore',
        icon: 'cash'
    },
];


interface SettingItemProps {
    icon: string;
    iconColor?: string;
    iconBg?: string;
    title: string;
    subtitle?: string;
    value?: string;
    showChevron?: boolean;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
    icon,
    iconColor = colors.white,
    iconBg = colors.primary,
    title,
    subtitle,
    value,
    showChevron = true,
    onPress,
    rightComponent,
}) => {
    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: iconBg + '30' }]}>
                    <Ionicons name={icon as any} size={20} color={iconColor} />
                </View>
                <View style={styles.settingTextContainer}>
                    <Typo size={15} color={colors.white} fontWeight="500">
                        {title}
                    </Typo>
                    {subtitle && (
                        <Typo size={12} color={colors.neutral400}>
                            {subtitle}
                        </Typo>
                    )}
                </View>
            </View>
            <View style={styles.settingRight}>
                {value && (
                    <Typo size={14} color={colors.neutral400} style={{ marginRight: 8 }}>
                        {value}
                    </Typo>
                )}
                {rightComponent}
                {showChevron && !rightComponent && (
                    <Ionicons name="chevron-forward" size={20} color={colors.neutral500} />
                )}
            </View>
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const navigation = useNavigation<Navigation>();

    // Contexts
    const { mode: themeMode, setMode: setThemeMode } = useTheme();
    const { currency, setCurrency } = useCurrency();

    // Modal States
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    // Handlers
    const handleThemeChange = (newTheme: string) => {
        setThemeMode(newTheme as 'light' | 'dark' | 'system');
    };

    const handleCurrencyChange = (newCurrency: string) => {
        setCurrency(newCurrency as CurrencyCode);
    };

    // Display Values
    const getThemeLabel = () => {
        const option = THEME_OPTIONS.find(opt => opt.value === themeMode);
        return option?.label || 'Dark Mode';
    };

    const getCurrencyLabel = () => {
        const curr = CURRENCIES[currency];
        return `${curr.code} - ${curr.symbol}`;
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <BackButton iconSize={24} />
                    <Typo size={18} fontWeight="700" color={colors.white}>
                        Settings
                    </Typo>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* GENERAL Section */}
                    <View style={styles.section}>
                        <Typo size={12} fontWeight="600" color={colors.white} style={styles.sectionHeader}>
                            GENERAL
                        </Typo>
                        <View style={styles.sectionContent}>
                            {/* Theme */}
                            <TouchableOpacity
                                style={styles.settingItem}
                                onPress={() => setShowThemeModal(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '30' }]}>
                                        <Ionicons name="moon" size={20} color={colors.white} />
                                    </View>
                                    <View style={styles.settingTextContainer}>
                                        <Typo size={15} color={colors.white} fontWeight="500">
                                            Theme
                                        </Typo>
                                    </View>
                                </View>
                                <View style={styles.settingRight}>
                                    <Typo size={14} color={colors.neutral400} style={{ marginRight: 8 }}>
                                        {getThemeLabel()}
                                    </Typo>
                                    <Ionicons name="chevron-forward" size={20} color={colors.neutral500} />
                                </View>
                            </TouchableOpacity>

                            {/* Currency */}
                            <TouchableOpacity
                                style={styles.settingItem}
                                onPress={() => setShowCurrencyModal(true)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '30' }]}>
                                        <Ionicons name="cash" size={20} color={colors.white} />
                                    </View>
                                    <View style={styles.settingTextContainer}>
                                        <Typo size={15} color={colors.white} fontWeight="500">
                                            Currency
                                        </Typo>
                                    </View>
                                </View>
                                <View style={styles.settingRight}>
                                    <Typo size={14} color={colors.neutral400} style={{ marginRight: 8 }}>
                                        {getCurrencyLabel()}
                                    </Typo>
                                    <Ionicons name="chevron-forward" size={20} color={colors.neutral500} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* SECURITY Section */}
                    <View style={styles.section}>
                        <Typo size={12} fontWeight="600" color={colors.white} style={styles.sectionHeader}>
                            SECURITY
                        </Typo>
                        <View style={styles.sectionContent}>
                            {/* Security & Password */}
                            <SettingItem
                                icon="lock-closed"
                                iconColor={colors.white}
                                iconBg={colors.primary}
                                title="Security & Password"
                                onPress={() => navigation.navigate('ChangePassword' as never)}
                            />

                            {/* Biometric Authentication */}
                            <View style={styles.settingItem}>
                                <View style={styles.settingLeft}>
                                    <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '30' }]}>
                                        <Ionicons name="finger-print" size={20} color={colors.white} />
                                    </View>
                                    <View style={styles.settingTextContainer}>
                                        <Typo size={15} color={colors.white} fontWeight="500">
                                            Biometric Authentication
                                        </Typo>
                                    </View>
                                </View>
                                <View style={styles.settingRight}>
                                    <Switch
                                        value={biometricEnabled}
                                        onValueChange={setBiometricEnabled}
                                        trackColor={{ false: colors.neutral700, true: colors.primary + '80' }}
                                        thumbColor={biometricEnabled ? colors.primary : colors.neutral400}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ACCOUNT Section */}
                    <View style={styles.section}>
                        <Typo size={12} fontWeight="600" color={colors.white} style={styles.sectionHeader}>
                            ACCOUNT
                        </Typo>
                        <View style={styles.sectionContent}>
                            {/* Notification Settings */}
                            <SettingItem
                                icon="notifications"
                                iconColor={colors.white}
                                iconBg={colors.primary}
                                title="Notification Settings"
                                onPress={() => {
                                    // TODO: Navigate to notification settings
                                }}
                            />

                            {/* Privacy Policy */}
                            <SettingItem
                                icon="shield-checkmark"
                                iconColor={colors.white}
                                iconBg={colors.primary}
                                title="Privacy Policy"
                                onPress={() => {
                                    // TODO: Navigate to privacy policy
                                }}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Modals */}
                <OptionSelectorModal
                    visible={showThemeModal}
                    onClose={() => setShowThemeModal(false)}
                    title="Select Theme"
                    options={THEME_OPTIONS}
                    selectedValue={themeMode}
                    onSelect={handleThemeChange}
                />

                <OptionSelectorModal
                    visible={showCurrencyModal}
                    onClose={() => setShowCurrencyModal(false)}
                    title="Select Currency"
                    options={CURRENCY_OPTIONS}
                    selectedValue={currency}
                    onSelect={handleCurrencyChange}
                />
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
        paddingVertical: spacingY._15,
    },
    scrollContent: {
        paddingHorizontal: spacingX._20,
        paddingBottom: spacingY._30,
    },
    section: {
        marginBottom: spacingY._25,
    },
    sectionHeader: {
        marginBottom: spacingY._12,
        letterSpacing: 0.5,
    },
    sectionContent: {
        backgroundColor: colors.neutral800,
        borderRadius: radius._20,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.neutral700,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    settingTextContainer: {
        flex: 1,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
