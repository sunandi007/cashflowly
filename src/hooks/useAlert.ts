import { useContext } from 'react';
import { AlertContext, AlertButton } from '@/contexts/AlertContext';
import { AlertType } from '@/components/CustomAlert';

interface AlertOptions {
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

/**
 * Custom hook to access the global alert functionality.
 * Use this hook to show alerts from anywhere in your application.
 * 
 * @example
 * ```tsx
 * const alert = useAlert();
 * 
 * // Simple alert
 * alert('Success', 'Your transaction was saved!');
 * 
 * // Alert with type
 * alert('Error', 'Something went wrong', undefined, { type: 'error' });
 * 
 * // Alert with buttons (React Native Alert.alert style)
 * alert('Delete Transaction', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'Delete', onPress: () => deleteTransaction() }
 * ]);
 * ```
 */
export function useAlert() {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }

    /**
     * Show an alert dialog
     * @param title - The title of the alert
     * @param message - The message content
     * @param buttons - Optional array of buttons (similar to React Native Alert.alert)
     * @param options - Optional configuration (type, confirmText, cancelText, callbacks)
     */
    const alert = (
        title: string,
        message: string,
        buttons?: AlertButton[],
        options?: AlertOptions,
        icon?: boolean
    ) => {
        context.showAlert(title, message, buttons, options, icon);
    };

    return alert;
}

/**
 * Helper functions for common alert types
 */
export const AlertHelpers = {
    success: (title: string, message: string, onConfirm?: () => void) => {
        const context = useContext(AlertContext);
        if (!context) throw new Error('useAlert must be used within an AlertProvider');

        context.showAlert(title, message, undefined, {
            type: 'success',
            onConfirm,
        });
    },

    error: (title: string, message: string, onConfirm?: () => void) => {
        const context = useContext(AlertContext);
        if (!context) throw new Error('useAlert must be used within an AlertProvider');

        context.showAlert(title, message, undefined, {
            type: 'error',
            onConfirm,
        });
    },

    warning: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void) => {
        const context = useContext(AlertContext);
        if (!context) throw new Error('useAlert must be used within an AlertProvider');

        context.showAlert(title, message, undefined, {
            type: 'warning',
            onConfirm,
            onCancel,
        });
    },

    info: (title: string, message: string, onConfirm?: () => void) => {
        const context = useContext(AlertContext);
        if (!context) throw new Error('useAlert must be used within an AlertProvider');

        context.showAlert(title, message, undefined, {
            type: 'info',
            onConfirm,
        });
    },

    confirm: (
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        options?: { confirmText?: string; cancelText?: string; type?: AlertType }
    ) => {
        const context = useContext(AlertContext);
        if (!context) throw new Error('useAlert must be used within an AlertProvider');

        context.showAlert(title, message, undefined, {
            type: options?.type || 'warning',
            confirmText: options?.confirmText,
            cancelText: options?.cancelText,
            onConfirm,
            onCancel,
        });
    },
};
