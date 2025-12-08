// src/components/ColorSelector.tsx

import React from 'react';
import { Modal, View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { colors, spacingX } from '@/constant/theme';
import Header from './Header';
import { COLOR_OPTIONS } from '@/constant/categoryOptions';

const numColumns = 6;
const { width } = Dimensions.get('window');

interface ColorSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (hexCode: string) => void;
    currentColor: string;
}

export default function ColorSelector({ visible, onClose, onSelect, currentColor }: ColorSelectorProps) {
    const renderColorItem = ({ item }: any) => (
        <TouchableOpacity 
            style={[
                styles.colorItem, 
                { backgroundColor: item.value },
                currentColor === item.value && styles.activeColorItem
            ]} 
            onPress={() => onSelect(item.value)}
        >
            {/* Tampilkan centang jika warna ini yang terpilih */}
            {currentColor === item.value && (
                <Ionicons name="checkmark-circle" size={24} color={colors.white} />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <Header
                    title="Pilih Warna"
                    leftIcon={
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="chevron-back" size={30} color={colors.white} />
                        </TouchableOpacity>
                    }
                />
                
                <FlatList
                    data={COLOR_OPTIONS}
                    renderItem={renderColorItem}
                    keyExtractor={(item) => item.value}
                    numColumns={numColumns}
                    contentContainerStyle={styles.listContainer}
                />
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
        paddingHorizontal: spacingX._20,
    },
    listContainer: {
        paddingTop: 10,
    },
    colorItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: width / numColumns - 20,
        width: width / numColumns - 20,
        margin: 5,
        borderRadius: 50, // Bulat
        borderWidth: 1,
        borderColor: colors.neutral700,
    },
    activeColorItem: {
        borderWidth: 4,
        borderColor: colors.white, 
    }
});