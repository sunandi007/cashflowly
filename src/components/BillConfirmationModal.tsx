// src/components/BillConfirmationModal.tsx

import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import Header from './Header';
import { useAlert } from '@/hooks/useAlert';
import { colors, spacingX, spacingY, radius } from '@/constant/theme';
import { toTitleCase } from '@/utils/text';
import { scale, verticalScale } from '@/utils/styling';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BillConfirmationModalProps {
    bill: any;
    visible: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    isProcessing: boolean;
}

export default function BillConfirmationModal({
    bill,
    visible,
    onClose,
    onConfirm,
    isProcessing
}: BillConfirmationModalProps) {
    const [amountInput, setAmountInput] = useState('');
    const alert = useAlert();
    const { formatMoney, symbol } = useCurrency();

    useEffect(() => {
        if (visible && bill) {
            // Inisialisasi input dengan jumlah tagihan saat ini
            setAmountInput(String(bill.amount));
        } else if (!visible) {
            setAmountInput('');
        }
    }, [visible, bill]);

    const handleConfirm = () => {
        const numericAmount = Number(amountInput.replace(/\./g, '')) || 0;

        if (numericAmount <= 0) {
            alert("Error", "Jumlah pembayaran harus lebih besar dari nol.", undefined, { type: 'error' });
            return;
        }

        onConfirm(numericAmount);
    };

    // Format to compact (e.g., "Rp 1jt", "$ 1k")
    const formatCompact = (number: number) => {
        if (number >= 1000000) {
            return `${symbol} ${(number / 1000000).toFixed(0)}jt`;
        }
        if (number >= 1000) {
            return `${symbol} ${(number / 1000).toFixed(0)}rb`;
        }
        return `${symbol} ${number}`;
    };

    // Format date
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return format(date, 'd MMM yyyy', { locale: id });
        } catch {
            return dateStr;
        }
    };

    if (!bill) return null;

    const categoryName = bill.categories?.name || 'Tagihan';
    const iconName = bill.categories?.icon || 'cart-outline';
    const bgColor = bill.categories?.bgColor || colors.primary;
    const numericAmount = Number(amountInput.replace(/\./g, '')) || 0;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Handle Bar */}
                    <View style={styles.handleBar} />
                    {/* Header */}
                    <Header
                        title="Bayar Tagihan"
                        subtitle="Konfirmasi pembayaran tagihan ini"
                        showClose
                        onClose={onClose}
                        style={styles.header}
                    />

                    {/* Bill Info Card */}
                    <View style={styles.billInfoCard}>
                        {/* Left: Icon */}
                        <View style={[styles.billIcon, { backgroundColor: bgColor }]}>
                            <Ionicons
                                name={iconName as any}
                                size={scale(22)}
                                color={colors.white}
                            />
                        </View>

                        {/* Middle: Bill Details */}
                        <View style={styles.billDetails}>
                            <Text style={styles.billName}>{toTitleCase(categoryName)}</Text>
                            <View style={styles.billMeta}>
                                <View style={styles.tagBadge}>
                                    <Text style={styles.tagBadgeText}>TAGIHAN</Text>
                                </View>
                                <Text style={styles.billDate}>{formatDate(bill.date)}</Text>
                            </View>
                        </View>

                        {/* Right: Estimated Amount */}
                        <View style={styles.estimatedSection}>
                            <Text style={styles.estimatedLabel}>ESTIMASI</Text>
                            <Text style={styles.estimatedAmount}>{formatCompact(bill.amount)}</Text>
                        </View>
                    </View>

                    {/* Amount Input Section */}
                    <Text style={styles.inputLabel}>Jumlah Pembayaran Aktual</Text>

                    <View style={styles.amountInputContainer}>
                        <Text style={styles.currencyPrefix}>{symbol}</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0"
                            placeholderTextColor={colors.neutral500}
                            keyboardType="numeric"
                            value={amountInput}
                            onChangeText={(text) => {
                                // Format dengan titik sebagai pemisah ribuan
                                const numericValue = text.replace(/\D/g, "");
                                setAmountInput(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                            }}
                        />
                    </View>

                    {/* Confirm Button */}
                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            isProcessing && styles.confirmButtonDisabled
                        ]}
                        onPress={handleConfirm}
                        disabled={isProcessing}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>
                            {isProcessing
                                ? "Memproses..."
                                : `Bayar`
                            }
                        </Text>
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
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modal: {
        backgroundColor: colors.neutral900,
        borderTopLeftRadius: scale(24),
        borderTopRightRadius: scale(24),
        paddingHorizontal: spacingX._20,
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(40),
    },

    // Header
    header: {
        marginBottom: verticalScale(24),
        paddingHorizontal: 0,
        paddingVertical: 10,
        minHeight: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral800,
    },
    // Bill Info Card
    billInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral800,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(24),
    },
    billIcon: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(14),
    },
    billDetails: {
        flex: 1,
        gap: verticalScale(6),
    },
    billName: {
        fontSize: scale(17),
        fontWeight: '700',
        color: colors.white,
    },
    handleBar: {
        width: 40, height: 5, backgroundColor: colors.neutral700,
        borderRadius: 2, alignSelf: 'center', marginTop: -4, marginBottom: 10
    },
    billMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    tagBadge: {
        backgroundColor: colors.neutral700,
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    tagBadgeText: {
        fontSize: scale(10),
        fontWeight: '600',
        color: colors.neutral300,
        letterSpacing: 0.5,
    },
    billDate: {
        fontSize: scale(13),
        color: colors.neutral400,
    },
    estimatedSection: {
        alignItems: 'flex-end',
    },
    estimatedLabel: {
        fontSize: scale(10),
        fontWeight: '600',
        color: colors.neutral400,
        letterSpacing: 0.5,
        marginBottom: verticalScale(4),
    },
    estimatedAmount: {
        fontSize: scale(15),
        fontWeight: '700',
        color: colors.primary,
    },

    // Amount Input
    inputLabel: {
        fontSize: scale(14),
        fontWeight: '500',
        color: colors.neutral300,
        marginBottom: verticalScale(12),
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral800,
        borderRadius: scale(16),
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
        marginBottom: verticalScale(24),
    },
    currencyPrefix: {
        fontSize: scale(24),
        fontWeight: '600',
        color: colors.primary,
        marginRight: scale(12),
    },
    amountInput: {
        flex: 1,
        fontSize: scale(28),
        fontWeight: '700',
        color: colors.white,
        padding: 0,
    },

    // Confirm Button
    confirmButton: {
        backgroundColor: colors.primary,
        borderRadius: radius._30,
        paddingVertical: verticalScale(15),
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.6,
    },
    confirmButtonText: {
        fontSize: scale(16),
        fontWeight: '700',
        color: colors.neutral900,
    },
});