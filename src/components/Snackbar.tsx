import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';

const { width } = Dimensions.get('window');

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
    visible: boolean;
    type: SnackbarType;
    title: string;
    message?: string;
    duration?: number;
    onDismiss: () => void;
    actionText?: string;
    onActionPress?: () => void;
}

const SNACKBAR_CONFIG = {
    success: {
        icon: 'checkmark-circle' as const,
        iconColor: colors.accentGreen,
        borderColor: colors.accentGreen,
    },
    warning: {
        icon: 'warning' as const,
        iconColor: '#FBBF24',
        borderColor: '#FBBF24',
    },
    error: {
        icon: 'close-circle' as const,
        iconColor: colors.rose,
        borderColor: colors.rose,
    },
    info: {
        icon: 'information-circle' as const,
        iconColor: '#60A5FA',
        borderColor: '#60A5FA',
    },
};

export default function Snackbar({
    visible,
    type,
    title,
    message,
    duration = 4000,
    onDismiss,
    actionText = 'Tutup',
    onActionPress,
}: SnackbarProps) {
    // UBAH 1: Mulai dari -150 (Di atas layar), bukan 100
    const translateY = useSharedValue(-150);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            // Show animation (Turun ke posisi 0)
            translateY.value = withSpring(0, {
                damping: 40,
                stiffness: 400,
            });
            opacity.value = withTiming(1, { duration: 200 });

            // Auto-dismiss
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleDismiss();
                }, duration);

                return () => clearTimeout(timer);
            }
        } else {
            // Hide animation (Naik kembali ke -150)
            translateY.value = withTiming(-150, { duration: 200 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, duration]);

    const handleDismiss = () => {
        // UBAH 2: Dismiss ke arah atas (-150)
        translateY.value = withTiming(-150, { duration: 200 }, () => {
            runOnJS(onDismiss)();
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    const handleAction = () => {
        if (onActionPress) {
            onActionPress();
        }
        handleDismiss();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    // UBAH 3: Cek kondisi null terhadap nilai negatif
    if (!visible && translateY.value === -150) return null;

    const config = SNACKBAR_CONFIG[type];

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View
                style={[
                    styles.snackbar,
                    { borderLeftColor: config.borderColor },
                ]}
            >
                {/* Icon */}
                <View style={[styles.iconContainer, { backgroundColor: config.borderColor + '20' }]}>
                    <Ionicons name={config.icon} size={24} color={config.iconColor} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    onPress={handleAction}
                    style={styles.actionButton}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.actionText, { color: config.borderColor }]}>
                        {actionText}
                    </Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // UBAH 4: Ganti bottom menjadi top
        // Berikan jarak cukup untuk Status Bar / Notch (sekitar 50-60 biasanya aman)
        top: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(40),
        left: scale(16),
        right: scale(16),
        zIndex: 9999,
    },
    snackbar: {
        backgroundColor: colors.neutral800,
        borderRadius: scale(12),
        borderLeftWidth: 4,
        padding: scale(16),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: scale(14),
        fontWeight: '600',
        color: colors.white,
        marginBottom: verticalScale(2),
    },
    message: {
        fontSize: scale(12),
        color: colors.neutral400,
        marginTop: verticalScale(2),
    },
    actionButton: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
    },
    actionText: {
        fontSize: scale(13),
        fontWeight: '600',
    },
});