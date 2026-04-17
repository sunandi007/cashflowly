import React, { useEffect, useState } from "react";
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Text,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacingX, spacingY } from "@/constant/theme";
import { scale, verticalScale } from "@/utils/styling";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    FadeIn,
    FadeOut,
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
        icon: "checkmark-circle" as const,
        color: "#23C16B",
        bgColor: "rgba(35, 193, 107, 0.12)",
        borderColor: "rgba(35, 193, 107, 0.25)",
    },
    error: {
        icon: "close-circle" as const,
        color: "#FF4D4D",
        bgColor: "rgba(255, 77, 77, 0.12)",
        borderColor: "rgba(255, 77, 77, 0.25)",
    },
    info: {
        icon: "information-circle" as const,
        color: "#3B82F6",
        bgColor: "rgba(59, 130, 246, 0.12)",
        borderColor: "rgba(59, 130, 246, 0.25)",
    },
    warning: {
        icon: "warning" as const,
        color: "#FF4D4D",
        bgColor: "rgba(255, 77, 77, 0.12)",
        borderColor: "rgba(255, 77, 77, 0.25)",
    },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CustomAlert({
    visible,
    type = "info",
    title,
    message,
    onClose,
    onConfirm,
    confirmText = "OK",
    cancelText = "Batal",
    icon = true,
}: CustomAlertProps) {
    const [showModal, setShowModal] = useState(visible);
    const scaleValue = useSharedValue(0.85);
    const opacityValue = useSharedValue(0);
    const translateY = useSharedValue(20);

    const config = ALERT_CONFIG[type];
    const isDestructive = type === "warning" || type === "error";
    const hasCancel = !!onConfirm;

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            opacityValue.value = withTiming(1, { duration: 200 });
            scaleValue.value = withSpring(1, {
                damping: 18,
                stiffness: 200,
                mass: 0.8,
            });
            translateY.value = withSpring(0, {
                damping: 18,
                stiffness: 200,
            });
        } else {
            opacityValue.value = withTiming(0, { duration: 180 });
            scaleValue.value = withTiming(0.9, { duration: 180 });
            translateY.value = withTiming(10, { duration: 180 }, () => {
                runOnJS(setShowModal)(false);
            });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scaleValue.value },
            { translateY: translateY.value },
        ],
        opacity: opacityValue.value,
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacityValue.value,
    }));

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent>
            {/* Animated Backdrop */}
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={hasCancel ? undefined : onClose}
                />

                {/* Alert Card */}
                <Animated.View style={[styles.alertContainer, animatedStyle]}>

                    {/* Top accent bar */}
                    <View style={[styles.accentBar, { backgroundColor: config.color }]} />

                    <View style={styles.contentWrapper}>
                        {/* Icon */}
                        {icon && (
                            <View style={[styles.iconWrapper, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
                                <Ionicons
                                    name={config.icon}
                                    size={scale(36)}
                                    color={config.color}
                                />
                            </View>
                        )}

                        {/* Title */}
                        <Text style={styles.title}>{title}</Text>

                        {/* Message */}
                        <Text style={styles.message}>{message}</Text>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Buttons */}
                        <View style={styles.buttonContainer}>
                            {hasCancel ? (
                                <>
                                    {/* Confirm (primary action) */}
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.confirmButton,
                                            { backgroundColor: isDestructive ? "#FF4D4D" : config.color },
                                        ]}
                                        onPress={onConfirm}
                                        activeOpacity={0.75}
                                    >
                                        <Text style={[styles.buttonText, styles.confirmButtonText]}>
                                            {confirmText}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Cancel (secondary action) */}
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={onClose}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.buttonText, styles.cancelButtonText]}>
                                            {cancelText}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                /* Single dismiss button */
                                <TouchableOpacity
                                    style={[styles.button, styles.singleButton, { backgroundColor: config.color }]}
                                    onPress={onClose}
                                    activeOpacity={0.75}
                                >
                                    <Text style={[styles.buttonText, styles.confirmButtonText]}>
                                        {confirmText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacingX._30,
    },
    alertContainer: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: "#1a2630",
        borderRadius: radius._20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.45,
        shadowRadius: 30,
        elevation: 20,
    },
    accentBar: {
        height: 4,
        width: "100%",
    },
    contentWrapper: {
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(20),
        paddingHorizontal: spacingX._25,
        alignItems: "center",
    },
    iconWrapper: {
        width: scale(72),
        height: scale(72),
        borderRadius: scale(36),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: verticalScale(16),
        borderWidth: 1,
    },
    title: {
        fontSize: scale(18),
        fontWeight: "700",
        color: "#e9edef",
        textAlign: "center",
        marginBottom: verticalScale(8),
        letterSpacing: 0.2,
    },
    message: {
        fontSize: scale(13),
        color: "#8696a0",
        textAlign: "center",
        lineHeight: verticalScale(20),
        marginBottom: verticalScale(4),
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "rgba(255,255,255,0.07)",
        marginVertical: verticalScale(18),
    },
    buttonContainer: {
        width: "100%",
        gap: verticalScale(10),
    },
    button: {
        width: "100%",
        paddingVertical: verticalScale(13),
        borderRadius: radius._12,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmButton: {
        // background set dynamically
    },
    singleButton: {
        // background set dynamically
    },
    cancelButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    buttonText: {
        fontSize: scale(15),
        fontWeight: "600",
        letterSpacing: 0.2,
    },
    confirmButtonText: {
        color: "#ffffff",
    },
    cancelButtonText: {
        color: "#8696a0",
    },
});
