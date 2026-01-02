// src/components/UpcomingBillsSummaryCard.tsx

import React from 'react';
import { TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Typo from './Typo';
import { colors, spacingX } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { useBillsSummary } from '@/hooks/useBillsSummary'; // Hook ringkasan
import { toTitleCase } from '@/utils/text';

export default function UpcomingBillsSummaryCard() {
    const navigation = useNavigation();
    const { data: summary, isLoading } = useBillsSummary();
    
    const count = summary?.count || 0;
    const total = summary?.totalAmount || 0;
    const nextDate = summary?.nextDueDate 
        ? new Date(summary.nextDueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) 
        : 'N/A';

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
    };

    if (isLoading || count === 0) {
        // Tampilkan loading atau jangan tampilkan card jika tidak ada tagihan
        return isLoading ? null : <></>; 
    }

    return (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('BillsScreen' as never)} // <-- Navigasi ke screen detail
        >
            <View style={styles.iconContainer}>
                <Ionicons name="receipt-outline" size={24} color={colors.white} />
            </View>

            <View style={styles.info}>
                <Typo color={colors.white} fontWeight="700">
                    {count} Tagihan Aktif
                </Typo>
                <Typo color={colors.neutral400} size={12}>
                    Jatuh Tempo Terdekat: {nextDate}
                </Typo>
            </View>

            <View style={styles.amount}>
                 <Typo color={colors.rose} fontWeight="700">
                    Total: {formatCurrency(total)}
                </Typo>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.neutral800,
        borderRadius: 12,
        marginBottom: 20, // Tambahkan margin bawah agar tidak menempel ke list transaksi
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.rose,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    info: {
        flex: 1,
    },
    amount: {
        marginLeft: 15,
    }
});