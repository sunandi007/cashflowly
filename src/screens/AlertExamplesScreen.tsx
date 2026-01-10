import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAlert } from '@/hooks/useAlert';
import Typo from '@/components/Typo';
import { colors, radius, spacingX, spacingY } from '@/constant/theme';
import { verticalScale } from '@/utils/styling';

/**
 * Example component demonstrating various ways to use the CustomAlert
 * via the global useAlert hook.
 * 
 * This is a DEMONSTRATION component - you can use these patterns
 * in your actual screens.
 */
export default function AlertExamples() {
    const alert = useAlert();

    // Example 1: Simple info alert
    const showSimpleAlert = () => {
        alert('Information', 'This is a simple informational alert');
    };

    // Example 2: Success alert
    const showSuccessAlert = () => {
        alert(
            'Success!',
            'Your transaction has been saved successfully',
            undefined,
            { type: 'success' }
        );
    };

    // Example 3: Error alert
    const showErrorAlert = () => {
        alert(
            'Error',
            'Failed to save transaction. Please try again.',
            undefined,
            { type: 'error' }
        );
    };

    // Example 4: Warning alert with custom button
    const showWarningAlert = () => {
        alert(
            'Warning',
            'This action may affect your data',
            undefined,
            {
                type: 'warning',
                confirmText: 'I Understand',
            }
        );
    };

    // Example 5: Confirmation dialog (React Native style)
    const showConfirmation = () => {
        alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => console.log('Deletion cancelled'),
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        console.log('Transaction deleted');
                        // Perform deletion here
                    },
                },
            ],
            { type: 'error' }
        );
    };

    // Example 6: Alert with callbacks
    const showAlertWithCallbacks = () => {
        alert(
            'Save Changes',
            'Do you want to save your changes before leaving?',
            undefined,
            {
                type: 'warning',
                confirmText: 'Save',
                cancelText: 'Discard',
                onConfirm: () => {
                    console.log('Changes saved');
                    // Save logic here
                },
                onCancel: () => {
                    console.log('Changes discarded');
                    // Discard logic here
                },
            }
        );
    };

    // Example 7: Multiple buttons with different actions
    const showMultipleActions = () => {
        alert(
            'Export Data',
            'Choose how you want to export your transactions',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Export as CSV',
                    onPress: () => console.log('Exporting as CSV'),
                },
            ],
            { type: 'info' }
        );
    };

    // Example 8: Logout confirmation (real-world example)
    const showLogoutConfirmation = () => {
        alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: async () => {
                        console.log('Logging out...');
                        // await handleLogout();
                    },
                },
            ],
            { type: 'warning' }
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Typo size={24} fontWeight="700" color={colors.white} style={styles.title}>
                Alert Examples
            </Typo>

            <Typo size={14} color={colors.neutral400} style={styles.subtitle}>
                Tap any button to see the alert in action
            </Typo>

            <View style={styles.section}>
                <Typo size={18} fontWeight="600" color={colors.white} style={styles.sectionTitle}>
                    Basic Alerts
                </Typo>

                <TouchableOpacity style={styles.button} onPress={showSimpleAlert}>
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Simple Info Alert
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#23C16B' }]}
                    onPress={showSuccessAlert}
                >
                    <Typo size={16} fontWeight="500" color={colors.neutral900}>
                        Success Alert
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#FF4D4D' }]}
                    onPress={showErrorAlert}
                >
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Error Alert
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#F59E0B' }]}
                    onPress={showWarningAlert}
                >
                    <Typo size={16} fontWeight="500" color={colors.neutral900}>
                        Warning Alert
                    </Typo>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Typo size={18} fontWeight="600" color={colors.white} style={styles.sectionTitle}>
                    Confirmations
                </Typo>

                <TouchableOpacity style={styles.button} onPress={showConfirmation}>
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Delete Confirmation
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={showAlertWithCallbacks}>
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Save Changes Confirmation
                    </Typo>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={showLogoutConfirmation}>
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Logout Confirmation
                    </Typo>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Typo size={18} fontWeight="600" color={colors.white} style={styles.sectionTitle}>
                    Advanced
                </Typo>

                <TouchableOpacity style={styles.button} onPress={showMultipleActions}>
                    <Typo size={16} fontWeight="500" color={colors.white}>
                        Multiple Actions
                    </Typo>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral900,
    },
    content: {
        padding: spacingX._20,
        paddingBottom: verticalScale(40),
    },
    title: {
        marginBottom: verticalScale(8),
    },
    subtitle: {
        marginBottom: verticalScale(24),
    },
    section: {
        marginBottom: verticalScale(32),
    },
    sectionTitle: {
        marginBottom: verticalScale(12),
    },
    button: {
        backgroundColor: colors.neutral800,
        padding: spacingX._20,
        borderRadius: radius._20,
        marginBottom: verticalScale(12),
        alignItems: 'center',
    },
});
