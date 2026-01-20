import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { colors, spacingX, spacingY, radius } from '@/constant/theme';
import { toTitleCase } from '@/utils/text';
import { scale, verticalScale } from '@/utils/styling';
import Header from './Header';

interface BillDetailModalProps {
    bill: any;
    visible: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function BillDetailModal({ bill, visible, onClose, onEdit, onDelete }: BillDetailModalProps) {
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
        };
        return map[rule] || rule;
    };

    const getProgressText = () => {
        const paidCount = Number(bill.transaction_count) || 0;

        if (bill.end_condition === 'never') {
            return {
                label: 'Status',
                value: 'Berulang',
                sub: `Pembayaran ke-${paidCount}`,
                total: null
            };
        }

        if (bill.end_condition === 'after_count') {
            const totalTarget = Number(bill.end_value);
            const remaining = totalTarget - paidCount;

            return {
                label: 'Progres',
                value: `${paidCount} dari ${totalTarget}`,
                sub: `Sisa ${remaining} bulan`,
                total: totalTarget
            };
        }

        if (bill.end_condition === 'until_date') {
            const endDate = new Date(bill.end_value).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            return {
                label: 'Berakhir',
                value: endDate,
                sub: `Pembayaran ke-${paidCount}`,
                total: null
            };
        }

        return { label: 'Status', value: '-', sub: '', total: null };
    };

    const progress = getProgressText();
    const amount = Number(bill.amount) || 0;
    const formattedAmount = amount.toLocaleString('id-ID'); // Format lokal

    const nextDueDate = bill.next_due_date || bill.date;
    const formattedDueDate = new Date(nextDueDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Hitung hari tersisa (tanpa memperhitungkan jam, hanya tanggal)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset ke tengah malam

    const dueDate = new Date(nextDueDate);
    dueDate.setHours(0, 0, 0, 0); // Reset ke tengah malam

    const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const getDaysText = () => {
        if (daysUntilDue < 0) {
            const daysLate = Math.abs(daysUntilDue);
            if (daysLate === 1) return 'TERLAMBAT 1 HARI';
            return `TERLAMBAT ${daysLate} HARI`;
        }
        if (daysUntilDue === 0) return 'Jatuh Tempo Hari Ini';
        if (daysUntilDue === 1) return 'Jatuh Tempo Besok';
        if (daysUntilDue <= 3) return `Jatuh Tempo ${daysUntilDue} Hari Lagi`;
        return `${daysUntilDue} hari lagi`;
    };

    return (
        <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    {/* Header Top: Title & Close */}
                    <Header
                        title="Bayar Tagihan"
                        showClose
                        onClose={onClose}
                        style={styles.header}
                    />

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* Hero Section: Icon & Title */}
                        <View style={styles.heroSection}>
                            <View style={styles.iconWrapper}>
                                <Ionicons
                                    name={bill.categories?.icon || "receipt"}
                                    size={32}
                                    color={colors.accentGreen}
                                />
                            </View>
                            <Typo size={24} fontWeight="700" color={colors.white} style={{ marginTop: 15, marginBottom: 5 }}>
                                {toTitleCase(bill.categories?.name || 'Tagihan')}
                            </Typo>
                            <Typo size={14} color={colors.neutral400}>
                                Tagihan Rutin • Personal
                            </Typo>
                        </View>

                        {/* Details Card */}
                        <View style={styles.detailsCard}>
                            {/* Frequency Row */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <View style={styles.smallIconBox}>
                                        <Ionicons name="calendar" size={16} color={colors.neutral400} />
                                    </View>
                                    <Typo size={14} color={colors.neutral200} fontWeight="500">Frekuensi</Typo>
                                </View>
                                <Typo size={14} fontWeight="600" color={colors.white}>
                                    {getFrequencyText(bill.recurrence_rule)}
                                </Typo>
                            </View>

                            <View style={styles.divider} />

                            {/* Progress Row */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <View style={styles.smallIconBox}>
                                        <Ionicons name="pie-chart" size={16} color={colors.neutral400} />
                                    </View>
                                    <Typo size={14} color={colors.neutral200} fontWeight="500">{progress.label}</Typo>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Typo size={14} fontWeight="600" color={colors.accentGreen}>
                                        {progress.value} <View style={styles.dot} />
                                    </Typo>
                                    {progress.sub ? (
                                        <Typo size={11} color={colors.neutral500}>
                                            {progress.sub}
                                        </Typo>
                                    ) : null}
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Next Due Date Row */}
                            <View style={styles.detailRow}>
                                <View style={styles.detailLeft}>
                                    <View style={styles.smallIconBox}>
                                        <Ionicons name="time-outline" size={16} color={colors.neutral400} />
                                    </View>
                                    <Typo size={14} color={colors.neutral200} fontWeight="500">Jatuh Tempo</Typo>
                                </View>
                                <View style={{ alignItems: 'flex-end', maxWidth: '60%' }}>
                                    <Typo size={14} fontWeight="600" color={colors.white}>
                                        {formattedDueDate}
                                    </Typo>
                                    <View style={[
                                        styles.dueBadge,
                                        daysUntilDue <= 3 && daysUntilDue >= 0 ? styles.dueBadgeUrgent : {},
                                        daysUntilDue < 0 ? styles.dueBadgeOverdue : {}
                                    ]}>
                                        <Typo
                                            size={11}
                                            color={
                                                daysUntilDue < 0 ? colors.rose :
                                                    daysUntilDue <= 3 ? colors.primary :
                                                        colors.neutral400
                                            }
                                            fontWeight="600"
                                        >
                                            {getDaysText()}
                                        </Typo>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Amount Section */}
                        <View style={styles.amountSection}>
                            <Typo size={11} color={colors.neutral400} fontWeight="600" style={{ marginBottom: 10, letterSpacing: 0.5 }}>
                                JUMLAH PEMBAYARAN AKTUAL
                            </Typo>
                            <View style={styles.amountBox}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Typo size={16} fontWeight="600" color={colors.neutral500} style={{ marginRight: 5 }}>Rp</Typo>
                                    <Typo size={24} fontWeight="700" color={colors.white}>{formattedAmount}</Typo>
                                </View>
                                <View style={styles.maxBadge}>
                                    <Typo size={10} color={colors.accentGreen} fontWeight="700">Max</Typo>
                                </View>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity style={[styles.miniBtn, styles.btnEdit]} onPress={onEdit}>
                                <Ionicons name="create-outline" size={16} color={colors.white} />
                                <Typo size={12} fontWeight="600" color={colors.white} style={{ marginLeft: 6 }}>Edit Tagihan</Typo>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.miniBtn, styles.btnDanger]} onPress={onDelete}>
                                <Ionicons name="ban-outline" size={16} color={colors.rose} />
                                <Typo size={12} fontWeight="600" color={colors.rose} style={{ marginLeft: 6 }}>Hentikan Siklus</Typo>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.payBtn} activeOpacity={0.8} onPress={() => onClose()}>
                            <Typo size={18} fontWeight="700" color={colors.background}>
                                Bayar
                            </Typo>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modal: {
        backgroundColor: colors.background, // Dark Navy
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: spacingX._20,
        paddingBottom: 30,
        width: '100%',
        maxHeight: '90%',
    },
    handleBar: {
        width: 40, height: 4, backgroundColor: colors.neutral700,
        borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20
    },
    header: {
        marginBottom: verticalScale(24),
        paddingHorizontal: 0,
        paddingVertical: 0,
        minHeight: 0,
        borderBottomWidth: 1,
        paddingBottom: 6,
        borderBottomColor: colors.neutral800,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 30
    },
    iconWrapper: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: colors.neutral800,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: colors.neutral700
    },
    detailsCard: {
        backgroundColor: colors.neutral800 + '80', // Slightly transparent
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.neutral800,
        padding: 20,
        marginBottom: 25
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    smallIconBox: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: colors.neutral800,
        justifyContent: 'center', alignItems: 'center'
    },
    divider: {
        height: 1, backgroundColor: colors.neutral700,
        marginVertical: 15
    },
    dot: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: colors.accentGreen,
        display: 'flex', marginLeft: 4, transform: [{ translateY: -2 }]
    },
    amountSection: {
        marginBottom: 25
    },
    amountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.neutral800, // Input bg
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.neutral700
    },
    maxBadge: {
        backgroundColor: 'rgba(5, 199, 126, 0.15)', // Green tint
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 6
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16
    },
    miniBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1
    },
    btnEdit: {
        backgroundColor: colors.neutral800,
        borderColor: colors.neutral700
    },
    btnDanger: {
        backgroundColor: 'rgba(244, 63, 94, 0.10)',
        borderColor: 'rgba(244, 63, 94, 0.3)'
    },
    payBtn: {
        backgroundColor: colors.accentGreen,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: radius._30
    },
    dueBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 4
    },
    dueBadgeUrgent: {
        backgroundColor: 'rgba(5, 199, 126, 0.15)',
    },
    dueBadgeOverdue: {
        backgroundColor: 'rgba(244, 63, 94, 0.15)',
    }
});