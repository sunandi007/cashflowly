// src/screens/SearchScreen.tsx

import React, {useMemo, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Platform,
} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {useCategories} from "@/hooks/useCategories";
import Typo from "@/components/Typo";
import {colors, spacingY, spacingX} from "@/constant/theme";
import Input from "@/components/Input";
import TransactionList from "@/components/TransactionList";
import {useTransactions} from "@/hooks/useTransactions";
import Header from "@/components/Header";
import {useFilteredTransactions} from "@/hooks/useFilteredTransactions";
import {useAuth} from "@/hooks/useAuth";
import {Ionicons} from "@expo/vector-icons";
import ScreenWrapper from "@/components/ScreenWrapper";
import {
    startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear,
    isWithinInterval, startOfDay, endOfDay
} from 'date-fns';
import DateTimePicker from "@react-native-community/datetimepicker";
import IconComponent from "@/components/Icons";
import {verticalScale} from "@/utils/styling";

const PERIOD_OPTIONS = [
    {label: 'Bulan Ini', value: 'this_month'},
    {label: 'Bulan Lalu', value: 'last_month'},
    {label: '3 Bulan Terakhir', value: 'last_3_months'},
    {label: 'Tahun Ini', value: 'this_year'},
    {label: 'Custom', value: 'custom'}
];

export default function SearchScreen() {
    const navigation = useNavigation<any>();
    const {session} = useAuth();
    const userId = session?.user?.id;

    const {data: categories = []} = useCategories(userId);
    const {data: allTransactions = [], isLoading} = useTransactions(userId, 'all');

    const [activePeriod, setActivePeriod] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState(new Date());
    const [customEndDate, setCustomEndDate] = useState(new Date());

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

            return isWithinInterval(txDate, {start: intervalStart, end: intervalEnd});
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
            ? {...item, idToUpdate: item.id.replace(/^transfer-/, "")}
            : {...item, idToUpdate: item.id};
        navigation.navigate("TransactionScreen", {initialData: payloadForModal});
    };

    return (
        <ScreenWrapper style={styles.container}>
            {/* 1. HEADER */}
            <Header
                title={"Pencarian"}
                leftIcon={
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.white}/>
                    </TouchableOpacity>
                }
            />

            <View style={styles.stickyHeaderContainer}>
                <Input
                    placeholder="Cari transaksi (kopi, gaji, dll)..."
                    value={search}
                    placeholderTextColor={colors.neutral400}
                    onChangeText={(value) => setSearch(value)}
                    autoFocus={true}
                />

                {/* FILTER PERIODE */}
                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {PERIOD_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                style={[
                                    styles.chip,
                                    activePeriod === opt.value && styles.activeChip
                                ]}
                                onPress={() => setActivePeriod(opt.value)}
                            >
                                {opt.label !== 'Custom' &&

                                    <Text style={[
                                        styles.chipText,
                                        activePeriod === opt.value && styles.activeChipText
                                    ]}>
                                        {opt.label}
                                    </Text>
                                }
                                {opt.label === 'Custom' &&
                                    <IconComponent
                                        item={{icon: "calendar-outline"} as any}
                                        size={verticalScale(20)}
                                        color={colors.neutral300}
                                    />
                                }

                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {activePeriod === 'custom' && (
                    <View style={styles.customDateContainer}>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowStartDatePicker(true)}
                        >
                            <Typo size={12} color={colors.neutral400}>Dari:</Typo>
                            <Typo size={14} color={colors.white} fontWeight="600">
                                {customStartDate.toLocaleDateString('id-ID')}
                            </Typo>
                        </TouchableOpacity>

                        <Ionicons name="arrow-forward" size={16} color={colors.neutral500}/>

                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowEndDatePicker(true)}
                        >
                            <Typo size={12} color={colors.neutral400}>Sampai:</Typo>
                            <Typo size={14} color={colors.white} fontWeight="600">
                                {customEndDate.toLocaleDateString('id-ID')}
                            </Typo>
                        </TouchableOpacity>
                    </View>
                )}

                {/* CATEGORY FILTER */}
                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            style={[styles.chip, !category && styles.activeChip]}
                            onPress={() => toggleCategory(null)}
                        >
                            <Text style={[styles.chipText, !category && styles.activeChipText]}>
                                Semua Kategori
                            </Text>
                        </TouchableOpacity>

                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.chip, category === cat.id && styles.activeChip]}
                                onPress={() => toggleCategory(cat.id as any)}
                            >
                                <Text style={[styles.chipText, category === cat.id && styles.activeChipText]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* 3. LIST HASIL */}
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Typo color={colors.neutral400}>
                            {"Tidak ada transaksi ditemukan."}
                        </Typo>
                    </View>
                }
                renderItem={({item}) => (
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
    stickyHeaderContainer: {
        marginBottom: spacingY._10,
        marginTop: spacingY._10,
    },
    quickFilterContainer: {
        flexDirection: "row",
        marginTop: spacingY._15,
    },
    categoryChip: {
        borderWidth: 1,
        borderColor: colors.neutral700,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: colors.neutral800,
    },
    activeCategoryChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryChipText: {
        color: colors.neutral300,
        fontSize: 14,
    },
    activeCategoryChipText: {
        color: colors.black,
        fontWeight: "bold",
    },
    listContent: {
        paddingBottom: 50,
        gap: spacingY._10,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    filterRow: {
        flexDirection: "row",
        marginTop: spacingY._10,
    },
    chip: {
        borderWidth: 1,
        borderColor: colors.neutral700,
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: colors.neutral800,
    },
    activeChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        color: colors.neutral300,
        fontSize: 13,
    },
    activeChipText: {
        color: colors.black,
        fontWeight: "600",
    },
    customDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral800,
        borderRadius: 12,
        padding: 10,
        marginTop: spacingY._10,
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
    }
});