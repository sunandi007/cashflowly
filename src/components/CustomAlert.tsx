import React, { useEffect, useState } from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import Typo from "./Typo";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

export type AlertType = "success" | "error" | "info" | "warning";

type CustomAlertProps = {
    visible: boolean;
    type?: AlertType;
    title: string;
    message: string;
    onClose?: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    icon?: boolean;
};

const ALERT_CONFIG = {
    success: {
        icon: "checkmark",
        color: "#23C16B", // Green
        bgColor: "rgba(35, 193, 107, 0.15)",
    },
    error: {
        icon: "alert", // or warning
        color: "#FF4D4D", // Red
        bgColor: "rgba(255, 77, 77, 0.15)",
    },
    info: {
        icon: "information",
        color: "#3B82F6", // Blue
        bgColor: "rgba(59, 130, 246, 0.15)",
    },
    warning: {
        icon: "warning",
        color: "#F59E0B", // Amber
        bgColor: "rgba(245, 158, 11, 0.15)",
    },
};

export default function CustomAlert({
    visible,
    type = "info",
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "OK",
    cancelText = "Cancel",
    icon = true,
}: CustomAlertProps) {
    const [showModal, setShowModal] = useState(visible);
    const scaleValue = useSharedValue(0);
    const opacityValue = useSharedValue(0);

    const config = ALERT_CONFIG[type];

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            opacityValue.value = withTiming(1, { duration: 10 });
            scaleValue.value = withSpring(1, { damping: 80 });
        } else {
            opacityValue.value = withTiming(0, { duration: 10 }, () => {
                runOnJS(setShowModal)(false);
            });
            scaleValue.value = withTiming(0, { duration: 10 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scaleValue.value }],
        opacity: opacityValue.value,
    }));

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none">
            <View style={styles.overlay}>
                <Animated.View style={[styles.alertContainer, animatedStyle]}>
                    {/* Icon Circle */}
                    {icon && (
                        <View style={[styles.iconWrapper, { backgroundColor: config.bgColor }]}>
                            <Ionicons name={config.icon as any} size={40} color={config.color} />
                            {/* If type is error, maybe specifically use an exclamation icon if preferred, but 'alert' works */}
                        </View>
                    )}

                    {/* Title */}
                    <Typo size={20} fontWeight="700" color={colors.white} style={styles.title}>
                        {title}
                    </Typo>

                    {/* Message */}
                    <Typo size={14} color={colors.neutral400} style={styles.message}>
                        {message}
                    </Typo>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {type === "warning" || onConfirm ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.buttonText, { color: colors.white }]}>{cancelText}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton, { backgroundColor: config.color }]}
                                    onPress={onConfirm}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.buttonText, { color: colors.neutral900, fontWeight: '700' }]}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton, { backgroundColor: colors.neutral700 }]} // Using neutral/grey for single dismiss button like design "Tutup"
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.buttonText, { color: colors.white }]}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacingX._40,
    },
    alertContainer: {
        width: "100%",
        backgroundColor: colors.neutral800,
        borderRadius: radius._30,
        paddingVertical: verticalScale(30),
        paddingHorizontal: spacingX._25,
        alignItems: "center",
        maxWidth: 340,
        // Shadow for elevation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconWrapper: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: verticalScale(20),
    },
    title: {
        textAlign: "center",
        marginBottom: verticalScale(10),
    },
    message: {
        textAlign: "center",
        lineHeight: 22,
        marginBottom: verticalScale(25),
    },
    buttonContainer: {
        width: "100%",
        flexDirection: 'row',
        gap: scale(12),
    },
    button: {
        flex: 1,
        paddingVertical: verticalScale(14),
        borderRadius: radius._20,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButton: {
        // Background set dynamically
    },
    cancelButton: {
        backgroundColor: colors.neutral700,
    },
    buttonText: {
        fontSize: scale(16),
    },
});
