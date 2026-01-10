// src/components/SettingsModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Typo from './Typo';
import { colors, spacingX, spacingY } from "@/constant/theme";
import Header from './Header';
import BaseDropdown from './Dropdown';
import Button from './Button';
import { useProfile } from '@/hooks/useProfile';
import { useSnackbar } from '@/hooks/useSnackbar';

const CURRENCIES = [
    { label: 'Rupiah (IDR)', value: 'IDR' },
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
];

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
    const { profile, updateCurrency, isUpdatingCurrency } = useProfile();
    const currentCode = profile?.currency_code || 'IDR';
    const snackbar = useSnackbar();

    const [selectedCurrency, setSelectedCurrency] = useState(currentCode);

    useEffect(() => {
        if (visible) {
            setSelectedCurrency(currentCode);
        }
    }, [visible, currentCode]);

    const handleSave = async () => {
        if (selectedCurrency === currentCode) {
            onClose();
            return;
        }

        try {
            await updateCurrency(selectedCurrency);
            snackbar.success("Sukses", "Mata uang dasar berhasil diubah!");
            onClose();
        } catch (error: any) {
            snackbar.error("Gagal", error.message);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Header
                        title="Settings"
                        rightIcon={
                            <TouchableOpacity onPress={onClose}>
                                <Typo size={20} color={colors.neutral300}>✕</Typo>
                            </TouchableOpacity>
                        }
                    />

                    <View style={styles.settingItem}>
                        <Typo size={16} color={colors.white}>Mata Uang Dasar</Typo>
                        <BaseDropdown
                            data={CURRENCIES}
                            value={selectedCurrency}
                            placeholder="Pilih Mata Uang"
                            onChange={(item) => setSelectedCurrency(item.value as string)}
                        />
                    </View>

                    <Button
                        onPress={handleSave}
                        style={styles.saveButton}
                        loading={isUpdatingCurrency}
                    >
                        <Typo color={colors.black} fontWeight="700">
                            {isUpdatingCurrency ? "Menyimpan..." : "Simpan Perubahan"}
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
        minHeight: 300,
    },
    settingItem: {
        marginTop: spacingY._15,
        gap: spacingY._10,
    },
    saveButton: {
        marginTop: spacingY._30,
        backgroundColor: colors.primary,
    },
});