// src/components/BillDetailModal.tsx

import React from 'react';
import {Modal, View, StyleSheet, TouchableOpacity} from 'react-native';
import Typo from './Typo';
import {colors, spacingX, spacingY, radius} from '@/constant/theme';
import Header from './Header';
import {toTitleCase} from '@/utils/text';

interface BillDetailModalProps {
    bill: any;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function BillDetailModal({bill, visible, onClose, onEdit, onDelete}: BillDetailModalProps) {
    if (!bill) return null;

    // --- Helper untuk Menerjemahkan Data ---
    const getFrequencyText = (rule: string) => {
        const map: Record<string, string> = {
            'daily': 'Harian',
            'weekly': 'Mingguan',
            'monthly': 'Bulanan',
            'yearly': 'Tahunan',
            '2_weeks': 'Setiap 2 Minggu',
            '2_months': 'Setiap 2 Bulan',
            // ... map lainnya sesuai constant
        };
        return map[rule] || rule;
    };

    const getProgressText = () => {
        // Count yang SUDAH dibayar (dari database)
        const paidCount = Number(bill.transaction_count) || 0;
        const nextPaymentIndex = paidCount + 1;

        if (bill.end_condition === 'never') {
            return {
                label: 'Status',
                value: 'Berulang Selamanya',
                sub: `Akan menjadi pembayaran ke-${nextPaymentIndex}`
            };
        }

        if (bill.end_condition === 'after_count') {
            const totalTarget = Number(bill.end_value);
            const remaining = totalTarget - paidCount; // Sisa yang BELUM dibayar

            return {
                label: 'Progres Cicilan',
                // Menampilkan: "Pembayaran ke-2 dari 5"
                value: `Pembayaran ke-${nextPaymentIndex} dari ${totalTarget}`,
                // Menampilkan: "Sisa: 4x lagi" (jika baru bayar 1)
                sub: `Sisa: ${remaining}x pembayaran lagi`
            };
        }

        if (bill.end_condition === 'until_date') {
            const endDate = new Date(bill.end_value).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            return {
                label: 'Berakhir Pada',
                value: endDate,
                sub: paidCount === 0 ? `Pembayaran belum dilakukan` : `Pembayaran ke-${paidCount}`
            };
        }

        return {label: 'Status', value: '-', sub: ''};
    };

    const progress = getProgressText();

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.handleBar}/>

                    {/* Header dengan Nama Kategori */}
                    <View style={{alignItems: 'center', marginBottom: 20}}>
                        <Typo size={20} fontWeight="700" color={colors.white}>
                            {toTitleCase(bill.categories?.name || 'Detail Tagihan')}
                        </Typo>
                        <Typo size={14} color={colors.neutral400}>
                            {bill.note || 'Tidak ada catatan'}
                        </Typo>
                    </View>

                    {/* Info Grid */}
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Typo size={12} color={colors.neutral400}>Frekuensi</Typo>
                            <Typo size={16} fontWeight="600" color={colors.white}>
                                {getFrequencyText(bill.recurrence_rule)}
                            </Typo>
                        </View>
                        <View style={styles.infoItem}>
                            <Typo size={12} color={colors.neutral400}>{progress.label}</Typo>
                            <Typo size={16} fontWeight="600" color={colors.primary}>
                                {progress.value}
                            </Typo>
                            {progress.sub && (
                                <Typo size={12} color={colors.neutral400}>{progress.sub}</Typo>
                            )}
                        </View>
                    </View>

                    {/* Tombol Aksi (Edit & Hentikan) */}
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => {
                            onClose();
                            onEdit();
                        }}>
                            <Typo fontWeight="600" color={colors.white}>Edit Tagihan</Typo>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={() => {
                            onClose();
                            onDelete();
                        }}>
                            <Typo fontWeight="600" color={colors.white}>Hentikan Siklus</Typo>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Typo color={colors.neutral400}>Tutup</Typo>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        backgroundColor: colors.neutral900,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacingX._20,
        paddingBottom: 40,
    },
    handleBar: {
        width: 40, height: 5, backgroundColor: colors.neutral700,
        borderRadius: 2.5, alignSelf: 'center', marginBottom: 20, marginTop: 10
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
        backgroundColor: colors.neutral800,
        padding: 15,
        borderRadius: 12,
    },
    infoItem: {
        flex: 1,
        gap: 5,
    },
    actionContainer: {
        gap: 10,
        marginBottom: 15,
    },
    btn: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    btnOutline: {
        borderColor: colors.neutral600,
    },
    btnDanger: {
        backgroundColor: colors.rose + '20', // Transparent Red
        borderColor: colors.rose,
    },
    closeButton: {
        alignItems: 'center',
        padding: 10
    }
});