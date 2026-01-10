import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSnackbar, SnackbarHelpers } from '@/hooks/useSnackbar';
import Button from '@/components/Button';
import Typo from '@/components/Typo';
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY } from '@/constant/theme';
import { scale, verticalScale } from '@/utils/styling';

export default function SnackbarExamplesScreen() {
    const snackbar = useSnackbar();

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Typo size={24} fontWeight="700" color={colors.white} style={styles.title}>
                    Snackbar Examples
                </Typo>

                {/* Basic Examples */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        Basic Types
                    </Typo>

                    <Button
                        onPress={() => snackbar.success('Transfer successful', 'Money sent to Savings')}
                        style={[styles.button, { backgroundColor: colors.accentGreen }]}
                    >
                        <Typo color={colors.black} fontWeight="600">Success Snackbar</Typo>
                    </Button>

                    <Button
                        onPress={() => snackbar.error('Transaction failed', 'Please check your balance')}
                        style={[styles.button, { backgroundColor: colors.rose }]}
                    >
                        <Typo color={colors.white} fontWeight="600">Error Snackbar</Typo>
                    </Button>

                    <Button
                        onPress={() => snackbar.warning('Connectivity unstable', 'Data may not be synced')}
                        style={[styles.button, { backgroundColor: '#FBBF24' }]}
                    >
                        <Typo color={colors.black} fontWeight="600">Warning Snackbar</Typo>
                    </Button>

                    <Button
                        onPress={() => snackbar.info('Statement available')}
                        style={[styles.button, { backgroundColor: '#60A5FA' }]}
                    >
                        <Typo color={colors.black} fontWeight="600">Info Snackbar</Typo>
                    </Button>
                </View>

                {/* With Action */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        With Actions
                    </Typo>

                    <Button
                        onPress={() =>
                            snackbar.success('Item deleted', 'Moved to trash', {
                                actionText: 'Undo',
                                onActionPress: () => console.log('Undo clicked'),
                            })
                        }
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">With Undo Action</Typo>
                    </Button>

                    <Button
                        onPress={() =>
                            snackbar.error('Upload failed', 'Please try again', {
                                actionText: 'Retry',
                                onActionPress: () => console.log('Retry clicked'),
                                duration: 6000,
                            })
                        }
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">With Retry Action</Typo>
                    </Button>
                </View>

                {/* Custom Duration */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        Custom Duration
                    </Typo>

                    <Button
                        onPress={() => snackbar.success('Quick message!', undefined, { duration: 2000 })}
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Quick (2s)</Typo>
                    </Button>

                    <Button
                        onPress={() =>
                            snackbar.info('Processing...', 'This will take a while', { duration: 0 })
                        }
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">No Auto-dismiss</Typo>
                    </Button>
                </View>

                {/* Helpers */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        Helper Functions
                    </Typo>

                    <Button
                        onPress={() => SnackbarHelpers.saved(snackbar, 'Profile')}
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Saved Helper</Typo>
                    </Button>

                    <Button
                        onPress={() => SnackbarHelpers.networkError(snackbar)}
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Network Error</Typo>
                    </Button>

                    <Button
                        onPress={() => SnackbarHelpers.syncing(snackbar)}
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Syncing</Typo>
                    </Button>

                    <Button
                        onPress={() =>
                            SnackbarHelpers.unsavedChanges(snackbar, () => console.log('Discarded'))
                        }
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Unsaved Changes</Typo>
                    </Button>
                </View>

                {/* Queue Test */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        Queue System
                    </Typo>

                    <Button
                        onPress={() => {
                            snackbar.info('Step 1', 'Processing payment...');
                            snackbar.success('Step 2', 'Payment received');
                            snackbar.info('Step 3', 'Sending email...');
                            snackbar.success('Step 4', 'All done!');
                        }}
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Show 4 Snackbars (Queued)</Typo>
                    </Button>
                </View>

                {/* Manual Hide */}
                <View style={styles.section}>
                    <Typo size={16} fontWeight="600" color={colors.neutral300} style={styles.sectionTitle}>
                        Manual Control
                    </Typo>

                    <Button
                        onPress={() =>
                            snackbar.info('This stays until you hide it', undefined, { duration: 0 })
                        }
                        style={styles.button}
                    >
                        <Typo color={colors.black} fontWeight="600">Show Persistent</Typo>
                    </Button>

                    <Button
                        onPress={() => snackbar.hide()}
                        style={[styles.button, { backgroundColor: colors.neutral700 }]}
                    >
                        <Typo color={colors.white} fontWeight="600">Hide Current</Typo>
                    </Button>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacingX._20,
        paddingBottom: verticalScale(100),
    },
    title: {
        marginBottom: verticalScale(20),
    },
    section: {
        marginBottom: verticalScale(30),
    },
    sectionTitle: {
        marginBottom: verticalScale(12),
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    button: {
        marginBottom: verticalScale(10),
    },
});
