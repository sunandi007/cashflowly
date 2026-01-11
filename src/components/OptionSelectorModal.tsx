import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacingX, spacingY, radius } from "@/constant/theme";
import { Ionicons } from '@expo/vector-icons';
import Typo from './Typo';
import { scale } from '@/utils/styling';

export interface Option {
    value: string;
    label: string;
    description?: string;
    icon?: string;
}

interface OptionSelectorModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    selectedValue: string;
    onSelect: (value: string) => void;
}

export default function OptionSelectorModal({
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
}: OptionSelectorModalProps) {

    const handleSelect = (value: string) => {
        onSelect(value);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Typo size={20} fontWeight="700" color={colors.white}>
                            {title}
                        </Typo>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.neutral400} />
                        </TouchableOpacity>
                    </View>

                    {/* Options List */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                    >
                        {options.map((option) => {
                            const isSelected = option.value === selectedValue;

                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionItem,
                                        isSelected && styles.optionItemSelected
                                    ]}
                                    onPress={() => handleSelect(option.value)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.optionLeft}>
                                        {option.icon && (
                                            <View style={[
                                                styles.optionIcon,
                                                { backgroundColor: isSelected ? colors.primary + '20' : colors.neutral800 }
                                            ]}>
                                                <Ionicons
                                                    name={option.icon as any}
                                                    size={20}
                                                    color={isSelected ? colors.primary : colors.neutral400}
                                                />
                                            </View>
                                        )}
                                        <View style={styles.optionTextContainer}>
                                            <Typo
                                                size={16}
                                                fontWeight={isSelected ? "600" : "500"}
                                                color={isSelected ? colors.white : colors.neutral300}
                                            >
                                                {option.label}
                                            </Typo>
                                            {option.description && (
                                                <Typo size={13} color={colors.neutral400} style={{ marginTop: 2 }}>
                                                    {option.description}
                                                </Typo>
                                            )}
                                        </View>
                                    </View>

                                    {/* Checkmark */}
                                    {isSelected && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={24}
                                            color={colors.primary}
                                        />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: colors.neutral900,
        borderTopLeftRadius: radius._20,
        borderTopRightRadius: radius._20,
        maxHeight: '70%',
        paddingBottom: spacingY._20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._20,
        paddingBottom: spacingY._15,
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral800,
    },
    closeButton: {
        padding: scale(4),
    },
    scrollView: {
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._10,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacingY._15,
        paddingHorizontal: spacingX._15,
        marginVertical: spacingY._5,
        backgroundColor: colors.neutral800,
        borderRadius: radius._15,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    optionItemSelected: {
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIcon: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacingX._12,
    },
    optionTextContainer: {
        flex: 1,
    },
});
