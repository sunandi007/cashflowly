// src/components/UpcomingBillItem.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { spacingX, spacingY, radius } from '@/constant/theme';
import { toTitleCase } from '@/utils/text';
import { scale, verticalScale } from '@/utils/styling';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';

interface BillItemProps {
    item: any;
    onPayPress: (item: any) => void;
    onDeletePress: (item: any) => void;
    onEditPress: (item: any) => void;
    onDetailPress: (item: any) => void;
    isProcessing: boolean;
    formatCurrency: (amount: number) => string;
}

export default function UpcomingBillItem({
    item,
    onPayPress,
    onDeletePress,
    onEditPress,
    isProcessing,
    formatCurrency,
    onDetailPress
}: BillItemProps) {
    const { colors, isDark } = useTheme(); // Get dynamic colors

    const categoryName = item.categories?.name || item.note || "Bill";
    const iconName = item.categories?.icon || "receipt-outline";
    const dueDate = new Date(item.next_due_date || item.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = dueDate < today;

    // Format date like "Due Oct 1st"
    const formatDueDate = (date: Date): string => {
        try {
            const day = date.getDate();
            const suffix = getDaySuffix(day);
            const month = format(date, 'MMM');
            return `Due ${month} ${day}${suffix}`;
        } catch {
            return "Due soon";
        }
    };

    const getDaySuffix = (day: number): string => {
        if (day >= 11 && day <= 13) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };



    const dateDisplay = formatDueDate(dueDate);

    // Dynamic border style for light mode (same as TransactionItem)
    const cardBorderStyle = {
        borderWidth: 1,
        borderRadius: scale(16),
        borderColor: isDark ? 'transparent' : colors.neutral600,  // Border only in light mode
    };

    return (
        <TouchableOpacity
            style={[styles.billItem, cardBorderStyle, { backgroundColor: colors.neutral800 }]}
            activeOpacity={0.7}
            onPress={() => onDetailPress(item)}
        >
            {/* Left: Icon */}
            <View style={[styles.iconWrapper, { backgroundColor: item.categories?.bgColor || colors.neutral700 }]}>
                <Ionicons name={iconName as any} size={scale(22)} color={isDark ? colors.white : colors.text} />
            </View>

            {/* Middle: Info */}
            <View style={styles.infoSection}>
                <Text style={[styles.billName, { color: isDark ? colors.white : colors.text }]}>{toTitleCase(categoryName)}</Text>
                <Text style={[styles.billSubtitle, { color: colors.neutral400 }]}>
                    {dateDisplay} • {formatCurrency(item.amount)}
                </Text>
            </View>

            {/* Right: Pay Button */}
            <TouchableOpacity
                style={[styles.payButton, { borderColor: colors.primary }]}
                onPress={() => onPayPress(item)}
                disabled={isProcessing}
                activeOpacity={0.7}
            >
                <Text style={[styles.payButtonText, { color: colors.primary }]}>Pay</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    billItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(12),
    },
    iconWrapper: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(14),
    },
    infoSection: {
        flex: 1,
        gap: verticalScale(4),
    },
    billName: {
        fontSize: scale(16),
        fontWeight: '600',
    },
    billSubtitle: {
        fontSize: scale(13),
    },
    payButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        paddingHorizontal: scale(24),
        paddingVertical: verticalScale(10),
        borderRadius: scale(20),
    },
    payButtonText: {
        fontSize: scale(14),
        fontWeight: '600',
    },
});