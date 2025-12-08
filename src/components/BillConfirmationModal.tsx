// src/components/BillConfirmationModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Typo from './Typo';
import { colors, spacingX } from '@/constant/theme';
import Button from './Button';
import Header from './Header';
import { toTitleCase } from '@/utils/text';

interface BillConfirmationModalProps {
    bill: any;
    visible: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    isProcessing: boolean;
}

export default function BillConfirmationModal({ bill, visible, onClose, onConfirm, isProcessing }: BillConfirmationModalProps) {
    const [amountInput, setAmountInput] = useState('');

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
            Alert.alert("Error", "Jumlah pembayaran harus lebih besar dari nol.");
            return;
        }

        onConfirm(numericAmount);
    };

    // Fungsi formatting (untuk tampilan, bukan untuk input)
    const formatCurrency = (number: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(number);

    if (!bill) return null;

    const isExpense = bill.type === 'expense';

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Header title={`Bayar ${toTitleCase(bill.categories?.name || 'Tagihan')}`} rightIcon={
                        <TouchableOpacity onPress={onClose}><Typo size={20} color={colors.neutral400}>✕</Typo></TouchableOpacity>
                    } />

                    <View style={styles.detailRow}>
                        <Typo color={colors.neutral400}>Jumlah Estimasi:</Typo>
                        <Typo color={colors.neutral100} fontWeight="600">{formatCurrency(bill.amount)}</Typo>
                    </View>
                    <View style={styles.detailRow}>
                        <Typo color={colors.neutral400}>Jatuh Tempo:</Typo>
                        <Typo color={colors.neutral100} fontWeight="600">{new Date(bill.date).toLocaleDateString('id-ID')}</Typo>
                    </View>
                    
                    <Typo style={styles.prompt} color={colors.white}>
                        Masukkan Jumlah Pembayaran Aktual:
                    </Typo>

                    <TextInput
                        style={styles.input}
                        placeholder="Jumlah Aktual"
                        placeholderTextColor={colors.neutral500}
                        keyboardType="numeric"
                        value={amountInput}
                        onChangeText={(text) => {
                             // Logika formatting yang sama seperti di TransactionModal
                             const numericValue = text.replace(/\D/g, "");
                             setAmountInput(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."))
                        }}
                    />
                    
                    <Button 
                        onPress={handleConfirm} 
                        style={styles.confirmButton}
                        loading={isProcessing}
                        disabled={isProcessing}
                    >
                        <Typo color={colors.white} fontWeight="700">
                           {isProcessing ? "Memproses..." : `Bayar ${formatCurrency(Number(amountInput.replace(/\./g, '')) || 0)}`}
                        </Typo>
                    </Button>
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
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral800,
    },
    prompt: {
        marginTop: 20,
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.neutral800,
        color: colors.white,
        borderRadius: 10,
        padding: 15,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmButton: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    }
});