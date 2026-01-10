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
import Typo from "@/components/Typo";
import { colors, spacingY, spacingX, radius } from "@/constant/theme";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/hooks/useTransactions";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
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
    { label: 'This Month', value: 'this_month', icon: 'calendar' },
    { label: 'Last Month', value: 'last_month', icon: 'time-outline' },
    { label: 'Custom', value: 'custom', icon: 'calendar-outline' }
];

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const userId = session?.user?.id;

    const { data: categories = [] } = useCategories(userId);
    const { data: allTransactions = [], isLoading } = useTransactions(userId, 'all');

    const [activePeriod, setActivePeriod] = useState('this_month');
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
            <View style={styles.header}>
                <Typo size={22} fontWeight="700" color={colors.white}>
                    Search
                </Typo>
                {/* <TouchableOpacity style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={scale(24)} color={colors.white} />
                </TouchableOpacity> */}
            </View>

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

            {/* Period Filter Chips */}
            <View style={styles.chipsSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {PERIOD_OPTIONS.map((opt) => {
                        const isActive = activePeriod === opt.value;
                        return (
                            <TouchableOpacity
                                key={opt.value}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setActivePeriod(opt.value)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={opt.icon as any}
                                    size={scale(16)}
                                    color={isActive ? colors.neutral900 : colors.neutral300}
                                />
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Category Filter Chips */}
            <View style={styles.chipsSection}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipsRow}
                >
                    {/* All Categories */}
                    <TouchableOpacity
                        style={[styles.chip, !category && styles.chipActive]}
                        onPress={() => toggleCategory(null)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="apps"
                            size={scale(16)}
                            color={!category ? colors.neutral900 : colors.neutral300}
                        />
                        <Text style={[styles.chipText, !category && styles.chipTextActive]}>
                            All Categories
                        </Text>
                    </TouchableOpacity>

                    {/* Category Options */}
                    {categories.slice(0, 6).map((cat) => {
                        const isActive = category === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => toggleCategory(cat.id as any)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={getCategoryIcon(cat.name || '') as any}
                                    size={scale(16)}
                                    color={isActive ? colors.neutral900 : colors.neutral300}
                                />
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
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
        backgroundColor: colors.neutral900,
        paddingHorizontal: spacingX._20,
    },

    // Header
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: verticalScale(10),
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

    // Chips Section
    chipsSection: {
        marginTop: verticalScale(16),
    },
    chipsRow: {
        flexDirection: "row",
        gap: scale(10),
        paddingRight: scale(20),
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: scale(8),
        backgroundColor: colors.neutral800,
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(24),
    },
    chipActive: {
        backgroundColor: colors.primary,
    },
    chipText: {
        fontSize: scale(14),
        fontWeight: "500",
        color: colors.neutral300,
    },
    chipTextActive: {
        color: colors.neutral900,
        fontWeight: "600",
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
        marginTop: verticalScale(28),
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