// src/screens/SearchScreen.tsx

import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCategories } from "@/hooks/useCategories";
import { useWallets } from "@/hooks/useWallets";
import Typo from "@/components/Typo";
import Header from "@/components/Header";
import { colors, spacingY, spacingX, radius } from "@/constant/theme";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import FilterDropdown from "@/components/FilterDropdown";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import {
    startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear,
    isWithinInterval, startOfDay, endOfDay, format
} from 'date-fns';
import DateTimePicker from "@react-native-community/datetimepicker";
import { scale, verticalScale } from "@/utils/styling";

const PERIOD_OPTIONS = [
    { label: 'All Time', value: 'all_time', icon: 'list' },
    { label: 'This Month', value: 'this_month', icon: 'calendar' },
    { label: 'Last Month', value: 'last_month', icon: 'time-outline' },
    { label: 'Custom', value: 'custom', icon: 'calendar-outline' },
];

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const userId = session?.user?.id;

    const { data: categories = [] } = useCategories(userId);
    const { wallets } = useWallets();
    const { data: allTransactions = [], isLoading } = useTransactions(userId, 'all');

    const [activePeriod, setActivePeriod] = useState('all_time');
    const [customStartDate, setCustomStartDate] = useState(startOfMonth(new Date()));
    const [customEndDate, setCustomEndDate] = useState(endOfMonth(new Date()));

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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
            case 'last_3_months':
                intervalStart = subMonths(now, 3);
                intervalEnd = endOfDay(now);
                break;
            case 'this_year':
                intervalStart = startOfYear(now);
                intervalEnd = endOfYear(now);
                break;
            case 'custom':
                intervalStart = startOfDay(customStartDate);
                intervalEnd = endOfDay(customEndDate);
                break;
            default:
                return allTransactions;
        }

        return allTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return isWithinInterval(txDate, { start: intervalStart, end: intervalEnd });
        });

    }, [allTransactions, activePeriod, customStartDate, customEndDate]);

    const {
        filteredTransactions,
        search,
        setSearch,
        category,
        toggleCategory,
        walletId,
        setWalletId,
    } = useFilteredTransactions(timeFilteredTransactions);

    const handleTransactionPress = (item: any) => {
        const payloadForModal = item.is_transfer
            ? { ...item, idToUpdate: item.id.replace(/^transfer-/, "") }
            : { ...item, idToUpdate: item.id };
        navigation.navigate("TransactionScreen", { initialData: payloadForModal });
    };

    const formatDateDisplay = (date: Date): string => {
        return format(date, 'MMM dd, yyyy');
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

    return (
        <ScreenWrapper style={styles.container}>
            {/* Header */}
            <Header title="Search" style={styles.header} />

            {/* Search Input */}
            <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={scale(22)} color={colors.neutral500} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions, merchants"
                    placeholderTextColor={colors.neutral500}
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="close-circle" size={scale(18)} color={colors.neutral500} />
                    </TouchableOpacity>
                )}
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

                    {/* Wallet Filter */}
                    <View style={styles.filterItem}>
                        <FilterDropdown
                            data={[
                                { label: 'All Wallets', value: 'all', icon: 'wallet' },
                                ...wallets.map((w: any) => ({
                                    label: w.name,
                                    value: w.id,
                                    icon: w.icon || 'wallet-outline'
                                }))
                            ]}
                            value={walletId || 'all'}
                            onChange={(val) => setWalletId(val === 'all' ? null : val)}
                            placeholder="Wallet"
                            dropdownStyle={[
                                styles.roundedDropdown,
                                (!walletId || walletId === 'all') && styles.inactiveDropdown
                            ]}
                            iconStyle={walletId && walletId !== 'all' ? styles.iconDropdownStyle : styles.inactiveIconStyle}
                            selectedTextStyle={(!walletId || walletId === 'all') ? styles.inactiveTextStyle : undefined}
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
                            value={category || 'all'}
                            onChange={(val) => toggleCategory(val === 'all' ? null : val)}
                            placeholder="Category"
                            dropdownStyle={[
                                styles.roundedDropdown,
                                (!category || category === 'all') && styles.inactiveDropdown
                            ]}
                            iconStyle={category && category !== 'all' ? styles.iconDropdownStyle : styles.inactiveIconStyle}
                            selectedTextStyle={(!category || category === 'all') ? styles.inactiveTextStyle : undefined}
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

            {/* Results Header */}
            <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Recent Matches</Text>
                <Text style={styles.resultsCount}>{filteredTransactions.length} results</Text>
            </View>

            {/* Transaction List */}
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item, index) => `tx-${index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="search-outline" size={scale(48)} color={colors.neutral600} />
                        </View>
                        <Text style={styles.emptyTitle}>No transactions found</Text>
                        <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
                    </View>
                }
                ListFooterComponent={
                    filteredTransactions.length > 0 ? (
                        <Text style={styles.footerText}>No more results</Text>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TransactionList
                        data={[item]}
                        loading={false}
                        emptyListMessage=""
                        title=""
                        onEditPress={handleTransactionPress}
                        isLableSearch={false}
                    />
                )}
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
        backgroundColor: colors.neutral50,
        paddingHorizontal: spacingX._20,
    },

    // Header
    header: {
        paddingHorizontal: 0,
        paddingBottom: verticalScale(20),
    },
    settingsButton: {
        padding: scale(8),
    },

    // Search Input
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.neutral800,
        borderRadius: scale(16),
        paddingHorizontal: scale(16),
        height: verticalScale(52),
        gap: scale(12),
    },
    searchInput: {
        flex: 1,
        fontSize: scale(16),
        color: colors.white,
        paddingVertical: 0,
    },

    // Filters
    filtersWrapper: {
        marginTop: verticalScale(16),
    },
    filtersContent: {
        flexDirection: 'row',
        gap: scale(12),
        paddingRight: scale(20), // padding end for scroll
    },
    filterItem: {
        width: scale(140), // Fixed width for comfortable scroll items
    },
    roundedDropdown: {
        borderRadius: radius._30, // Make it fully rounded (pill shape)
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
        marginTop: verticalScale(20),
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

    // Results Header
    resultsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: verticalScale(16),
    },
    resultsTitle: {
        fontSize: scale(16),
        fontWeight: "600",
        color: colors.white,
    },
    resultsCount: {
        fontSize: scale(14),
        color: colors.neutral400,
    },

    // List
    listContent: {
        paddingBottom: verticalScale(100),
    },

    // Empty State
    emptyState: {
        alignItems: "center",
        paddingVertical: verticalScale(60),
    },
    emptyIcon: {
        width: scale(96),
        height: scale(96),
        borderRadius: scale(48),
        backgroundColor: colors.neutral800,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: verticalScale(16),
    },
    emptyTitle: {
        fontSize: scale(16),
        fontWeight: "600",
        color: colors.neutral300,
        marginBottom: verticalScale(4),
    },
    emptySubtitle: {
        fontSize: scale(14),
        color: colors.neutral500,
    },

    // Footer
    footerText: {
        fontSize: scale(13),
        color: colors.neutral500,
        textAlign: "center",
        paddingVertical: verticalScale(24),
    },
});