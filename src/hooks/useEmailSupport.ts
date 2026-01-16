import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/services/supabaseClient';
import { useAuth } from './useAuth';
import { useSnackbar } from '@/hooks/useSnackbar';

export const useEmailSupport = () => {
    const { session } = useAuth();
    const snackbar = useSnackbar();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

    // 1. Handle File Picking
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                // Max file size validation (e.g., 5MB)
                if (file.size && file.size > 5 * 1024 * 1024) {
                    snackbar.error(t('emailSupport.uploadFailed'), t('emailSupport.fileSizeLimit'));
                    return;
                }
                setAttachment(file);
            }
        } catch (err) {
            console.error('Error picking document:', err);
        }
    };

    // 2. Clear Attachment
    const removeAttachment = () => {
        setAttachment(null);
    };

    // 3. Upload File to Supabase Storage
    const uploadFile = async (userId: string) => {
        if (!attachment) return null;

        try {
            const fileExt = attachment.name.split('.').pop();
            const fileName = `${userId}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Read file as base64
            const base64 = await FileSystem.readAsStringAsync(attachment.uri, {
                encoding: 'base64',
            });

            // Convert base64 to ArrayBuffer
            const fileData = decode(base64);

            const { data, error } = await supabase.storage
                .from('support_attachments')
                .upload(filePath, fileData, {
                    contentType: attachment.mimeType || 'application/octet-stream',
                    upsert: true,
                });

            if (error) throw error;

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('support_attachments')
                .getPublicUrl(filePath);

            return publicUrlData.publicUrl;
        } catch (error) {
            throw new Error(t('emailSupport.uploadFailed'));
        }
    };

    // 4. Submit Ticket
    const submitTicket = async (subject: string, message: string, onSuccess: () => void) => {
        if (!session?.user) {
            snackbar.error(t('emailSupport.authError'), t('emailSupport.authRequired'));
            return;
        }

        if (!subject.trim() || !message.trim()) {
            snackbar.warning(t('emailSupport.validationError'), t('emailSupport.fieldsRequired'));
            return;
        }

        setLoading(true);
        try {
            let attachmentUrl = null;

            // Upload attachment if exists
            if (attachment) {
                attachmentUrl = await uploadFile(session.user.id);
            }

            // Insert Ticket into Database
            const { error } = await supabase.from('support_tickets').insert({
                user_id: session.user.id,
                email: session.user.email,
                subject: subject,
                message: message,
                attachment_url: attachmentUrl,
                status: 'open'
            });

            if (error) throw error;

            snackbar.success(t('emailSupport.success'), t('emailSupport.successMessage'));
            onSuccess();

        } catch (error: any) {
            snackbar.error(t('emailSupport.submissionFailed'), error.message || t('emailSupport.errorMessage'));
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        attachment,
        pickDocument,
        removeAttachment,
        submitTicket
    };
};