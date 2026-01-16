import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import { colors as themeColors, radius, spacingX, spacingY } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from '@/utils/styling';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HelpSupportScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme(); // Use theme context for dynamic colors
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [expandedId, setExpandedId] = useState<string | number | null>(null);
    const { t } = useLanguage();

    const filters = [
        { label: t('helpSupport.all'), value: 'all' },
        { label: t('faq.categories.transaction'), value: 'transaction' },
        { label: t('faq.categories.security'), value: 'security' },
        { label: t('faq.categories.account'), value: 'account' },
        { label: t('faq.categories.app_settings'), value: 'app_settings' },
    ];

    const faqs = t('faq.items', { returnObjects: true }) as unknown as Array<{
        id: string | number;
        question: string;
        answer: string;
        category: string;
    }>;

    const toggleExpand = (id: string | number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredFaqs = faqs.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header
                    title={t('helpSupport.title')}
                    showBack
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <Input
                            placeholder={t('helpSupport.searchPlaceholder')}
                            value={search}
                            onChangeText={setSearch}
                            icon={<Ionicons name="search" size={20} color={colors.neutral400} />}
                            containerStyle={styles.searchInput}
                        />
                    </View>

                    {/* Filter Chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                        {filters.map((filter, index) => {
                            const isActive = activeFilter === filter.value;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.filterChip,
                                        {
                                            backgroundColor: isActive ? colors.primary : colors.neutral800,
                                            borderColor: isActive ? colors.primary : colors.neutral700,
                                            marginRight: index === filters.length - 1 ? spacingX._20 : 10
                                        }
                                    ]}
                                    onPress={() => setActiveFilter(filter.value)}
                                >
                                    <Typo
                                        size={14}
                                        fontWeight={isActive ? "600" : "400"}
                                        color={isActive ? colors.black : colors.neutral400}
                                    >
                                        {filter.label}
                                    </Typo>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* FAQ Section */}
                    <View style={styles.sectionHeader}>
                        <Typo size={18} fontWeight="700">{t('helpSupport.faqTitle')}</Typo>
                        <TouchableOpacity>
                            <Typo size={14} color={colors.primary}>{t('dashboard.viewAll')}</Typo>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.faqList}>
                        {filteredFaqs.map((item) => {
                            const isExpanded = expandedId === item.id;
                            return (
                                <View key={item.id} style={styles.faqItem}>
                                    <TouchableOpacity
                                        style={styles.faqHeader}
                                        onPress={() => toggleExpand(item.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Typo size={16} fontWeight="600" style={{ flex: 1 }}>{item.question}</Typo>
                                        <Ionicons
                                            name="chevron-down"
                                            size={20}
                                            color={colors.primary}
                                            style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                                        />
                                    </TouchableOpacity>
                                    {isExpanded && (
                                        <View style={styles.faqContent}>
                                            <Typo size={14} color={colors.neutral400} style={{ lineHeight: 22 }}>
                                                {item.answer}
                                            </Typo>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {/* Contact Us Section */}
                    <View style={[styles.sectionHeader, { marginTop: spacingY._25, justifyContent: 'center' }]}>
                        <Typo size={12} fontWeight="700" color={colors.neutral400} style={{ letterSpacing: 1 }}>{t('helpSupport.contactTitle')}</Typo>
                        <View style={styles.sectionIndicator} />
                    </View>

                    <View style={styles.contactRow}>
                        <TouchableOpacity
                            style={styles.contactCard}
                            onPress={() => navigation.navigate('EmailSupport' as never)}
                        >
                            <View style={[styles.iconCircleIcon, { backgroundColor: 'rgba(35, 193, 107, 0.1)' }]}>
                                <Ionicons name="at" size={24} color={colors.primary} />
                            </View>
                            <Typo size={14} fontWeight="600" style={{ marginTop: 12 }}>{t('helpSupport.emailSupport')}</Typo>
                            <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>{t('helpSupport.emailSubtitle')}</Typo>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard}>
                            <View style={[styles.iconCircleIcon, { backgroundColor: 'rgba(35, 193, 107, 0.1)' }]}>
                                <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
                            </View>
                            <Typo size={14} fontWeight="600" style={{ marginTop: 12 }}>{t('helpSupport.liveChat')}</Typo>
                            <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>{t('helpSupport.chatSubtitle')}</Typo>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Typo size={12} color={colors.neutral500}>{t('helpSupport.footer')}</Typo>
                    </View>

                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: spacingY._40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: themeColors.neutral800, // Use themeColors for static reliance if needed, but context is better.
        // However, context 'colors' is available in scope.
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: themeColors.neutral700,
    },
    searchContainer: {
        paddingHorizontal: spacingX._20,
        marginTop: spacingY._10,
    },
    searchInput: {
        borderRadius: radius._30, // More rounded in design
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: themeColors.neutral700,
    },
    filterContainer: {
        paddingHorizontal: spacingX._20,
        marginTop: spacingY._20,
        maxHeight: 40,
    },
    filterChip: {
        paddingHorizontal: spacingX._20,
        paddingVertical: verticalScale(8),
        borderRadius: radius._20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacingX._20,
        marginTop: spacingY._30,
        marginBottom: spacingY._15,
        flexWrap: 'wrap',
    },
    sectionIndicator: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
        width: 20,
        height: 3,
        backgroundColor: themeColors.primary, // Using static temporarily
        borderRadius: 2
    },
    faqList: {
        paddingHorizontal: spacingX._20,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: themeColors.neutral800,
        paddingVertical: spacingY._15,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacingY._5,
    },
    faqContent: {
        marginTop: spacingY._10,
    },
    contactRow: {
        flexDirection: 'row',
        paddingHorizontal: spacingX._20,
        gap: spacingX._15,
        marginTop: spacingY._20,
    },
    contactCard: {
        flex: 1,
        backgroundColor: themeColors.neutral900, // Slightly lighter or darker? Image looks like card color
        borderWidth: 1,
        borderColor: themeColors.neutral800,
        borderRadius: radius._20,
        padding: spacingY._20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacingY._5,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacingY._40,
        marginBottom: spacingY._20,
    }
});
