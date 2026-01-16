import React, { useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SectionList, StatusBar, ScrollView, Text } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import { colors, spacingX, radius } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Typo from '@/components/Typo';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';
import TransactionItem from '@/components/TransactionItem';
import WalletAddModal from '@/components/WalletModal';
import { useWallets } from '@/hooks/useWallets';
import { useCategories } from '@/hooks/useCategories';
import { useTags } from '@/hooks/useTags';
import FilterDropdown from '@/components/FilterDropdown';
import {
    startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear,
    isWithinInterval, startOfDay, endOfDay, format
} from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

const PERIOD_OPTIONS = [
    { label: 'All Time', value: 'all_time', icon: 'list' },
    { label: 'This Month', value: 'this_month', icon: 'calendar' },
    { label: 'Last Month', value: 'last_month', icon: 'time-outline' },
    { label: 'Custom', value: 'custom', icon: 'calendar-outline' },
];

export default function WalletDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { wallet } = route.params as { wallet: any } || {};
    const { session } = useAuth();
    const userId = session?.user?.id;

    const [showAdd, setShowAdd] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [activePeriod, setActivePeriod] = useState('all_time');
    const [customStartDate, setCustomStartDate] = useState(startOfMonth(new Date()));
    const [customEndDate, setCustomEndDate] = useState(endOfMonth(new Date()));
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const { wallets, totalBalance, addWallet, updateWallet, deleteWallet } =
        useWallets();

    const { data: categories = [] } = useCategories(userId);
    const { tags = [] } = useTags();

    // Use specific hook for transactions
    const { data: allTransactions = [] } = useTransactions(userId, 'all');

    // Filter transactions for this wallet
    const walletTransactions = useMemo(() => {
        if (!wallet) return [];
        return allTransactions.filter((t: any) => {
            if (t.is_transfer) {
                // Match by wallet name (as useTransactions currently returns names for transfers)
                // Filter where this wallet is either source or destination
                return t.from_wallet === wallet.name || t.to_wallet === wallet.name;
            }
            // Normal transaction: match by wallet_id
            return t.wallet_id === wallet.id;
        });
    }, [allTransactions, wallet]);

    // Apply time filter first
    const timeFilteredTransactions = useMemo(() => {
        const now = new Date();
        let intervalStart: Date;
        let intervalEnd: Date;

        switch (activePeriod) {
            case 'this_month':
                intervalStart = startOfMonth(now);
                intervalEnd = endOfMonth(now);
                break;
            case 'last_month':
                const lastMonth = subMonths(now, 1);
                intervalStart = startOfMonth(lastMonth);
                intervalEnd = endOfMonth(lastMonth);
                break;
            case 'custom':
                intervalStart = startOfDay(customStartDate);
                intervalEnd = endOfDay(customEndDate);
                break;
            default:
                return walletTransactions;
        }

        return walletTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return isWithinInterval(txDate, { start: intervalStart, end: intervalEnd });
        });

    }, [walletTransactions, activePeriod, customStartDate, customEndDate]);

    // Apply category and tag filters
    const filteredTransactions = useMemo(() => {
        return timeFilteredTransactions.filter((t: any) => {
            const matchesCategory = !selectedCategory ||
                selectedCategory === 'all' ||
                t.category_id === selectedCategory;

            const matchesTag = !selectedTag ||
                selectedTag === 'all' ||
                t.tag_id === selectedTag;

            return matchesCategory && matchesTag;
        });
    }, [timeFilteredTransactions, selectedCategory, selectedTag]);

    // Calculate Statistics (Income vs Expense)
    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;

        filteredTransactions.forEach((t: any) => {
            const amount = Number(t.amount) || 0;
            if (t.is_transfer) {
                if (t.to_wallet === wallet?.name) {
                    income += amount; // Receiving money
                } else if (t.from_wallet === wallet?.name) {
                    expense += amount; // Sending money
                }
            } else {
                if (t.type === 'income') income += amount;
                if (t.type === 'expense') expense += amount;
            }
        });
        return { income, expense };
    }, [filteredTransactions, wallet]);

    // Group Transactions by Date (Today, Yesterday, etc.)
    const sections = useMemo(() => {
        const groups: Record<string, any[]> = {};

        filteredTransactions.forEach((t: any) => {
            const date = new Date(t.date || t.created_at);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            let title = date.toLocaleDateString("id-ID", { month: 'long', day: 'numeric', year: 'numeric' });

            if (date.toDateString() === today.toDateString()) title = "Today";
            else if (date.toDateString() === yesterday.toDateString()) title = "Yesterday";

            if (!groups[title]) {
                groups[title] = [];
            }
            groups[title].push(t);
        });

        return Object.keys(groups).map(date => ({
            title: date,
            data: groups[date]
        }));
    }, [filteredTransactions]);

    // Format Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleEditWallet = () => {
        setSelectedWallet(wallet as any);
        setShowAdd(true);
    };

    // Get category icon
    const getCategoryIcon = (name: string): string => {
        const iconMap: Record<string, string> = {
            'groceries': 'basket',
            'food': 'restaurant',
            'transport': 'car',
            'transportation': 'car',
            'shopping': 'bag-handle',
            'entertainment': 'game-controller',
            'bills': 'receipt',
            'salary': 'cash',
            'health': 'medkit',
            'education': 'school',
        };
        return iconMap[name?.toLowerCase()] || 'pricetag';
    };

    const formatDateDisplay = (date: Date): string => {
        return format(date, 'MMM dd, yyyy');
    };

    return (
        <ScreenWrapper style={styles.container}>
            <Header
                title="Wallet Details"
                showBack
                rightComponent={
                    <TouchableOpacity>
                        <Ionicons name="create-outline" size={scale(28)} color={colors.white} onPress={handleEditWallet} />
                    </TouchableOpacity>
                }
            />

            {/* Wallet Info Header */}
            <View style={styles.walletHeader}>
                <View style={styles.iconContainer}>
                    <Ionicons name="business" size={40} color={colors.primary} />
                </View>
                <Typo size={12} color={colors.neutral400} style={{ letterSpacing: 1, marginTop: 10 }}>
                    {wallet?.name?.toUpperCase() || "WALLET"}
                </Typo>
                <Typo size={36} fontWeight="700" color={colors.white} style={{ marginVertical: 5 }}>
                    {formatCurrency(wallet?.balance || 0)}
                </Typo>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Typo size={12} color={colors.neutral400} style={{ marginBottom: 5 }}>INCOME</Typo>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typo size={20} fontWeight="700" color={colors.white}>{formatCurrency(stats.income)}</Typo>
                        <Ionicons name="arrow-down-outline" size={16} color={colors.primary} />
                    </View>
                    <Typo size={12} color={colors.primary} style={{ marginTop: 5 }}>+12%</Typo>
                </View>
                <View style={styles.statCard}>
                    <Typo size={12} color={colors.neutral400} style={{ marginBottom: 5 }}>EXPENSE</Typo>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typo size={20} fontWeight="700" color={colors.white}>{formatCurrency(stats.expense)}</Typo>
                        <Ionicons name="arrow-up-outline" size={16} color={colors.rose} />
                    </View>
                    <Typo size={12} color={colors.rose} style={{ marginTop: 5 }}>-5%</Typo>
                </View>
            </View>

            {/* Filters Section (Swipeable Row) */}
            <View style={styles.filtersWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                >
                    {/* Period Filter */}
                    <View style={styles.filterItem}>
                        <FilterDropdown
                            data={PERIOD_OPTIONS}
                            value={activePeriod}
                            onChange={setActivePeriod}
                            placeholder="Period"
                            dropdownStyle={[
                                styles.roundedDropdown,
                                activePeriod === 'all_time' && styles.inactiveDropdown
                            ]}
                            iconStyle={activePeriod !== 'all_time' ? styles.iconDropdownStyle : styles.inactiveIconStyle}
                            selectedTextStyle={activePeriod === 'all_time' ? styles.inactiveTextStyle : undefined}
                        />
                    </View>

                    {/* Category Filter */}
                    <View style={styles.filterItem}>
                        <FilterDropdown
                            data={[
                                { label: 'All Categories', value: 'all', icon: 'apps' },
                                ...categories.map((cat: any) => ({
                                    label: cat.name,
                                    value: cat.id,
                                    icon: getCategoryIcon(cat.name)
                                }))
                            ]}
                            value={selectedCategory || 'all'}
                            onChange={(val) => setSelectedCategory(val === 'all' ? null : val)}
                            placeholder="Category"
                            dropdownStyle={[
                                styles.roundedDropdown,
                                (!selectedCategory || selectedCategory === 'all') && styles.inactiveDropdown
                            ]}
                            iconStyle={selectedCategory && selectedCategory !== 'all' ? styles.iconDropdownStyle : styles.inactiveIconStyle}
                            selectedTextStyle={(!selectedCategory || selectedCategory === 'all') ? styles.inactiveTextStyle : undefined}
                        />
                    </View>

                    {/* Tag Filter */}
                    <View style={styles.filterItem}>
                        <FilterDropdown
                            data={[
                                { label: 'All Tags', value: 'all', icon: 'pricetags' },
                                ...tags.map((tag: any) => ({
                                    label: tag.name,
                                    value: tag.id,
                                    icon: 'pricetag'
                                }))
                            ]}
                            value={selectedTag || 'all'}
                            onChange={(val) => setSelectedTag(val === 'all' ? null : val)}
                            placeholder="Tag"
                            dropdownStyle={[
                                styles.roundedDropdown,
                                (!selectedTag || selectedTag === 'all') && styles.inactiveDropdown
                            ]}
                            iconStyle={selectedTag && selectedTag !== 'all' ? styles.iconDropdownStyle : styles.inactiveIconStyle}
                            selectedTextStyle={(!selectedTag || selectedTag === 'all') ? styles.inactiveTextStyle : undefined}
                        />
                    </View>
                </ScrollView>
            </View>

            {/* Custom Date Range Section */}
            {activePeriod === 'custom' && (
                <View style={styles.customRangeCard}>
                    {/* Header */}
                    <View style={styles.customRangeHeader}>
                        <Text style={styles.customRangeLabel}>CUSTOM RANGE</Text>
                        <Ionicons name="calendar" size={scale(20)} color={colors.primary} />
                    </View>

                    {/* Date Pickers Row */}
                    <View style={styles.datePickersRow}>
                        {/* From Date */}
                        <View style={styles.datePickerCol}>
                            <Text style={styles.datePickerLabel}>From</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setShowStartDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="calendar-outline" size={scale(16)} color={colors.neutral400} />
                                <Text style={styles.datePickerText}>{formatDateDisplay(customStartDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Separator */}
                        <Text style={styles.dateSeparator}>—</Text>

                        {/* To Date */}
                        <View style={styles.datePickerCol}>
                            <Text style={styles.datePickerLabel}>To</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setShowEndDatePicker(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="calendar-outline" size={scale(16)} color={colors.neutral400} />
                                <Text style={styles.datePickerText}>{formatDateDisplay(customEndDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {/* Transactions List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <TransactionItem item={item} index={index} onEditPress={(item) => navigation.navigate('TransactionScreen', { initialData: item } as any)} />
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Typo size={16} fontWeight="600" color={colors.white}>{title}</Typo>
                        <Typo size={12} color={colors.neutral400}>{sections.find(s => s.title === title)?.data.length} transactions</Typo>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: spacingX._20 }}
                stickySectionHeadersEnabled={false}
                style={{ flex: 1 }}
            />

            <WalletAddModal
                visible={showAdd}
                onClose={() => setShowAdd(false)}
                onSave={(payload) => addWallet.mutate(payload)}
                onUpdate={(payload) => updateWallet.mutate(payload)}
                onDelete={(id) => deleteWallet.mutate(id)}
                initialData={selectedWallet}
            />

            {/* Date Pickers */}
            {showStartDatePicker && (
                <DateTimePicker
                    value={customStartDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowStartDatePicker(false);
                        if (selectedDate) setCustomStartDate(selectedDate);
                    }}
                />
            )}

            {showEndDatePicker && (
                <DateTimePicker
                    value={customEndDate}
                    mode="date"
                    display="default"
                    minimumDate={customStartDate}
                    onChange={(event, selectedDate) => {
                        setShowEndDatePicker(false);
                        if (selectedDate) setCustomEndDate(selectedDate);
                    }}
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    walletHeader: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: colors.neutral800,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral700,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral800,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 8,
        marginTop: 15,
        borderWidth: 1,
        borderColor: colors.neutral700
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacingX._20,
        gap: 15,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.neutral800,
        borderRadius: 20,
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    // Filters
    filtersWrapper: {
        paddingHorizontal: spacingX._20,
    },
    filtersContent: {
        flexDirection: 'row',
        gap: scale(12),
        paddingRight: scale(20),
    },
    filterItem: {
        width: scale(140),
    },
    roundedDropdown: {
        borderRadius: radius._30,
        height: verticalScale(40),
        backgroundColor: colors.primary,
    },
    iconDropdownStyle: {
        tintColor: colors.white,
    },
    inactiveDropdown: {
        backgroundColor: colors.neutral800,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    inactiveIconStyle: {
        tintColor: colors.neutral400,
    },
    inactiveTextStyle: {
        color: colors.neutral400,
    },

    // Custom Range Card
    customRangeCard: {
        marginHorizontal: spacingX._20,
        backgroundColor: colors.neutral800,
        borderRadius: scale(16),
        padding: scale(16),
    },
    customRangeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: verticalScale(16),
    },
    customRangeLabel: {
        fontSize: scale(12),
        fontWeight: "600",
        color: colors.neutral400,
        letterSpacing: 0.5,
    },
    datePickersRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: scale(12),
    },
    datePickerCol: {
        flex: 1,
    },
    datePickerLabel: {
        fontSize: scale(12),
        color: colors.neutral500,
        marginBottom: verticalScale(8),
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(10),
        backgroundColor: colors.neutral700,
        paddingVertical: verticalScale(14),
        paddingHorizontal: scale(14),
        borderRadius: scale(12),
    },
    datePickerText: {
        fontSize: scale(14),
        fontWeight: "600",
        color: colors.white,
    },
    dateSeparator: {
        fontSize: scale(16),
        color: colors.neutral600,
        paddingBottom: verticalScale(14),
    },
});


