// src/components/FloatingAddButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, radius } from '@/constant/theme';
import { scale } from '@/utils/styling';

interface FloatingAddButtonProps {
    bottom?: number;
    right?: number;
    style?: ViewStyle;
}

export default function FloatingAddButton({
    bottom = 50,
    right = 20,
    style
}: FloatingAddButtonProps) {
    const navigation = useNavigation<any>();

    const handlePress = () => {
        navigation.navigate('TransactionScreen');
    };

    return (
        <TouchableOpacity
            style={[
                styles.floatingButton,
                { bottom, right },
                style
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Ionicons name="add" size={scale(32)} color={colors.neutral900} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        width: scale(60),
        height: scale(60),
        borderRadius: radius._30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 3,
        borderColor: colors.neutral800,
    },
});
