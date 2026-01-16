import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import ScreenWrapper from '@/components/ScreenWrapper';
import Header from '@/components/Header';
import Typo from '@/components/Typo';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { colors, radius, spacingX, spacingY } from '@/constant/theme';
import { Ionicons } from '@expo/vector-icons';
import { scale, verticalScale } from '@/utils/styling';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
// Import custom hook
import { useEmailSupport } from '@/hooks/useEmailSupport';

const EmailSupportScreen = () => {
    const navigation = useNavigation();
    const { t } = useLanguage();
    const { session } = useAuth();

    // Hook Integration
    const { loading, attachment, pickDocument, removeAttachment, submitTicket } = useEmailSupport();

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = () => {
        submitTicket(subject, message, () => {
            navigation.goBack();
        });
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Header title={t('emailSupport.title')} showBack />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                    {/* From Field */}
                    <View style={styles.fieldContainer}>
                        <Typo size={14} color={colors.neutral400} style={styles.label}>
                            {t('emailSupport.from')}
                        </Typo>
                        <View style={[styles.disabledInput, styles.inputContainer]}>
                            <Typo size={14} color={colors.neutral400}>
                                {session?.user?.email || 'user@example.com'}
                            </Typo>
                        </View>
                    </View>

                    {/* Subject Field */}
                    <View style={styles.fieldContainer}>
                        <Typo size={14} color={colors.neutral400} style={styles.label}>
                            {t('emailSupport.subject')}
                        </Typo>
                        <Input
                            placeholder={t('emailSupport.subjectPlaceholder')}
                            value={subject}
                            onChangeText={setSubject}
                            containerStyle={styles.inputContainer}
                        />
                    </View>

                    {/* Message Field */}
                    <View style={styles.fieldContainer}>
                        <Typo size={14} color={colors.neutral400} style={styles.label}>
                            {t('emailSupport.message')}
                        </Typo>
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={styles.textArea}
                                placeholder={t('emailSupport.messagePlaceholder')}
                                placeholderTextColor={colors.neutral400}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Attachment Section */}
                    <View style={styles.attachmentContainer}>
                        {attachment ? (
                            // View when file is selected
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="document-text" size={32} color={colors.primary} />
                                <Typo size={14} fontWeight="600" style={{ marginTop: 5, textAlign: 'center' }}>
                                    {attachment.name}
                                </Typo>
                                <Typo size={12} color={colors.neutral400} style={{ marginTop: 2 }}>
                                    {(attachment.size ? (attachment.size / 1024).toFixed(2) : 0) + ' KB'}
                                </Typo>
                                <TouchableOpacity onPress={removeAttachment} style={[styles.uploadButton, { backgroundColor: colors.rose }]}>
                                    <Typo size={14} fontWeight="600" color={colors.white}>
                                        {t('emailSupport.removeFile') || 'Remove File'}
                                    </Typo>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            // Default upload view
                            <View style={{ alignItems: 'center' }}>
                                <Ionicons name="attach" size={32} color={colors.primary} style={{ transform: [{ rotate: '45deg' }] }} />
                                <Typo size={16} fontWeight="600" style={{ marginTop: 10 }}>
                                    {t('emailSupport.attach')}
                                </Typo>
                                <Typo size={12} color={colors.neutral400} style={{ marginTop: 4 }}>
                                    {t('emailSupport.attachDesc')}
                                </Typo>

                                <TouchableOpacity onPress={pickDocument} style={styles.uploadButton}>
                                    <Typo size={14} fontWeight="600" color={colors.white}>
                                        {t('emailSupport.upload')}
                                    </Typo>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </ScrollView>

                <View style={styles.footer}>
                    <Button onPress={handleSend} loading={loading} style={styles.sendButton}>
                        <Typo fontWeight="700" color={colors.black}>
                            {t('emailSupport.send')}
                        </Typo>
                    </Button>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default EmailSupportScreen;

// Keep your existing styles as they are
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacingX._20,
        paddingTop: spacingY._20,
        paddingBottom: spacingY._60,
    },
    fieldContainer: {
        marginBottom: spacingY._20,
    },
    label: {
        marginBottom: spacingY._10,
        marginLeft: spacingX._5,
    },
    inputContainer: {
        backgroundColor: colors.neutral800,
        borderWidth: 1,
        borderColor: colors.neutral700,
        borderRadius: radius._15,
    },
    disabledInput: {
        height: verticalScale(54),
        justifyContent: 'center',
        paddingHorizontal: spacingX._15,
        backgroundColor: colors.neutral900,
        opacity: 0.7,
    },
    textAreaContainer: {
        height: verticalScale(150),
        padding: spacingY._15,
    },
    textArea: {
        flex: 1,
        color: colors.white,
        fontSize: verticalScale(14),
    },
    attachmentContainer: {
        marginTop: spacingY._10,
        backgroundColor: 'rgba(35, 193, 107, 0.05)',
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        borderRadius: radius._20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacingY._25,
        paddingHorizontal: spacingX._15,
    },
    uploadButton: {
        marginTop: spacingY._15,
        backgroundColor: colors.neutral700,
        paddingHorizontal: spacingX._20,
        paddingVertical: verticalScale(8),
        borderRadius: radius._10,
    },
    footer: {
        padding: spacingX._20,
        paddingBottom: spacingY._20,
        backgroundColor: 'transparent',
    },
    sendButton: {
        backgroundColor: colors.primary,
    }
});