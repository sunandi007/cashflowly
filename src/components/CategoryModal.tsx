// src/components/CategoryModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Typo from './Typo';
import { colors, spacingX, spacingY } from "@/constant/theme";
import Header from './Header';
import Input from './Input';
import Button from './Button';
import BaseDropdown from './Dropdown';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';

interface Category {
    id: string;
    name: string;
    icon: string;
    type: 'income' | 'expense' | 'transfer';
    bgColor: string;
}

interface CategoryModalProps {
    visible: boolean;
    onClose: () => void;
    initialData: Category | null;
}

// Daftar Tipe Kategori (dapat diperluas)
const TYPE_OPTIONS = [
    { label: 'Pemasukan (Income)', value: 'income' },
    { label: 'Pengeluaran (Expense)', value: 'expense' },
];

// Daftar Ikon Dummy (Ganti dengan ikon actual Anda, misalnya dari Ionicons)
const ICON_OPTIONS = [
    { label: 'Shopping Bag', value: 'bag-handle-outline' },
    { label: 'Cash', value: 'cash-outline' },
    { label: 'Car', value: 'car-outline' },
    { label: 'Home', value: 'home-outline' },
];

// Daftar Warna Dummy (Ganti dengan palet warna aktual Anda)
const COLOR_OPTIONS = [
    { label: 'Orange', value: '#FBBF24' },
    { label: 'Blue', value: '#177AD5' },
    { label: 'Green', value: '#4ADE80' },
    { label: 'Red', value: colors.rose },
];


export default function CategoryModal({ visible, onClose, initialData }: CategoryModalProps) {
    const isEditing = !!initialData;
    const { addCategory, updateCategory, isCreating, isUpdating } = useCategoryMutations();
    
    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
    const [icon, setIcon] = useState('');
    const [bgColor, setBgColor] = useState('#FBBF24');

    useEffect(() => {
        if (visible && initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setIcon(initialData.icon);
            setBgColor(initialData.bgColor);
        } else if (visible) {
            // Reset state saat ADD
            setName('');
            setType('expense');
            setIcon('');
            setBgColor('#FBBF24');
        }
    }, [visible, initialData]);

    const handleSave = async () => {
        if (!name || !icon || !type) {
            return Alert.alert('Error', 'Nama, Tipe, dan Ikon wajib diisi.');
        }

        const payload = { name, type, icon, bgColor };
        const isBusy = isCreating || isUpdating;

        if (isBusy) return;

        try {
            if (isEditing && initialData) {
                // UPDATE
                await updateCategory({ id: initialData.id, updates: payload });
                Alert.alert('Sukses', 'Kategori berhasil diperbarui.');
            } else {
                // CREATE
                await addCategory(payload);
                Alert.alert('Sukses', 'Kategori baru berhasil ditambahkan.');
            }
            onClose();
        } catch (error: any) {
            Alert.alert('Gagal', error.message);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Header
                        title={isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
                        rightIcon={
                            <TouchableOpacity onPress={onClose}>
                                <Typo size={20} color={colors.neutral300}>✕</Typo>
                            </TouchableOpacity>
                        }
                    />
                    
                    <View style={styles.formContainer}>
                        <Input 
                            placeholder="Nama Kategori (misal: Gaji, Makan Siang)" 
                            value={name} 
                            onChangeText={setName} 
                        />
                        
                        <BaseDropdown
                            data={TYPE_OPTIONS}
                            value={type}
                            placeholder="Pilih Tipe"
                            onChange={(item) => setType(item.value as any)}
                        />
                        
                        <BaseDropdown
                            data={ICON_OPTIONS}
                            value={icon}
                            placeholder="Pilih Ikon"
                            onChange={(item) => setIcon(item.value as any)}
                        />

                        <BaseDropdown
                            data={COLOR_OPTIONS}
                            value={bgColor}
                            placeholder="Pilih Warna"
                            onChange={(item) => setBgColor(item.value as any)}
                        />
                    </View>

                    <Button 
                        onPress={handleSave} 
                        style={styles.saveButton}
                        loading={isCreating || isUpdating}
                    >
                        <Typo color={colors.black} fontWeight="700">
                            {isCreating || isUpdating ? "Memproses..." : (isEditing ? "Update Kategori" : "Tambah Kategori")}
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
        minHeight: 450,
    },
    formContainer: {
        marginTop: spacingY._15,
        gap: spacingY._15,
    },
    saveButton: {
        marginTop: spacingY._30,
        backgroundColor: colors.primary,
    },
});