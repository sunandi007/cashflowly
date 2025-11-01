// src/components/IconSelector.tsx

import React from 'react';
import { Modal, View, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { colors, spacingX } from '@/constant/theme';
import Header from './Header';
import { ICON_OPTIONS } from '@/constant/categoryOptions';

const numColumns = 5;
const { width } = Dimensions.get('window');

interface IconSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (iconName: string) => void;
    currentIcon: string;
}

export default function IconSelector({ visible, onClose, onSelect, currentIcon }: IconSelectorProps) {
    const renderIconItem = ({ item }: any) => (
        <TouchableOpacity 
            style={[
                styles.iconItem, 
                currentIcon === item.value && styles.activeIconItem
            ]} 
            onPress={() => onSelect(item.value)}
        >
            <Ionicons 
                name={item.value as any} 
                size={30} 
                color={currentIcon === item.value ? colors.primary : colors.white} 
            />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <SafeAreaView style={styles.container}>
                <Header
                    title="Pilih Ikon"
                    leftIcon={
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="chevron-back" size={30} color={colors.white} />
                        </TouchableOpacity>
                    }
                />
                
                <FlatList
                    data={ICON_OPTIONS}
                    renderItem={renderIconItem}
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
    iconItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: width / numColumns - 20, // Hitung lebar agar muat 5 kolom
        width: width / numColumns - 20,
        margin: 5,
        borderRadius: 8,
        backgroundColor: colors.neutral800,
    },
    activeIconItem: {
        borderWidth: 2,
        borderColor: colors.primary,
    }
});