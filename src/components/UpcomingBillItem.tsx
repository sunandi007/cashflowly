// src/components/UpcomingBillItem.tsx (Layout Diperbaiki)

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { colors, spacingX, spacingY } from '@/constant/theme'; // Tambahkan spacingY
import { toTitleCase } from '@/utils/text';
import { scale } from '@/utils/styling'; // Asumsi scale diimpor

// Interface props (seperti yang didefinisikan di BillsScreen)
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
    
    const categoryName = item.categories?.name || "N/A";
    const iconName = item.categories?.icon || "alert-circle-outline";
    const dueDate = new Date(item.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const isOverdue = dueDate < today;
    
    const dateDisplay = dueDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric" // Tambahkan tahun agar jelas
    });
    
    const dateColor = isOverdue ? colors.rose : colors.neutral400;
    const isExpense = item.type === "expense";

    return (
        <TouchableOpacity style={styles.billItem}
                          activeOpacity={0.7}
                          onPress={() => onDetailPress(item)}>
            
            {/* Baris Atas: Info Kategori dan Tombol Edit/Delete */}
            <View style={styles.topRow}>
                <View style={styles.info}>
                    <View style={[styles.iconWrapper, { backgroundColor: item.categories?.bgColor || colors.neutral700 }]}>
                        <Ionicons name={iconName} size={scale(20)} color={colors.white} />
                    </View>
                    <Typo color={colors.white} fontWeight="600" size={16}>
                        {toTitleCase(categoryName)}
                    </Typo>
                </View>

                {/*<View style={styles.editActions}>*/}
                {/*    <TouchableOpacity onPress={() => onEditPress(item)} style={styles.actionButton}>*/}
                {/*        <Ionicons name="create-outline" size={scale(24)} color={colors.neutral400} />*/}
                {/*    </TouchableOpacity>*/}
                {/*    <TouchableOpacity onPress={() => onDeletePress(item)} style={styles.actionButton}>*/}
                {/*        <Ionicons name="trash-outline" size={scale(24)} color={colors.rose} />*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}
            </View>

            {/* Garis Pemisah */}
            <View style={styles.divider} />

            {/* Baris Bawah: Info Tanggal dan Tombol Bayar */}
            <View style={styles.bottomRow}>
                <View style={styles.textWrapper}>
                    <Typo color={dateColor} size={13} fontWeight="500">
                        {isOverdue ? "JATUH TEMPO" : "Jatuh Tempo:"} {dateDisplay}
                    </Typo>
                    <Typo color={isExpense ? colors.rose : colors.primary} fontWeight="700" size={18}>
                        {formatCurrency(item.amount)}
                    </Typo>
                </View>
                
                <TouchableOpacity 
                    style={styles.payButton} 
                    onPress={() => onPayPress(item)} 
                    disabled={isProcessing}
                >
                    <Typo color={colors.black} size={14} fontWeight="bold">
                        Bayar
                    </Typo>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// STYLES BARU UNTUK LAYOUT DUA BARIS
const styles = StyleSheet.create({
    billItem: {
        backgroundColor: colors.neutral800,
        borderRadius: 12, // Sedikit lebih besar
        padding: 15,
        width: "100%",
        marginBottom: 12,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1, // Ambil sisa ruang
    },
    iconWrapper: {
        width: scale(40),
        height: scale(40),
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 5,
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: colors.neutral700,
        marginVertical: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textWrapper: {
        flexDirection: 'column',
    },
    payButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20, // Tombol lebih besar
        paddingVertical: 10,
        borderRadius: 8,
        marginLeft: 10,
    },
});