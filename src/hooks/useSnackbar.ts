import { useContext } from 'react';
import { SnackbarContext } from '@/contexts/SnackbarContext';
import { SnackbarType } from '@/components/Snackbar';

/**
 * Hook to show snackbar notifications globally.
 * 
 * @example
 * Basic usage:
 * ```tsx
 * const snackbar = useSnackbar();
 * 
 * // Simple info snackbar
 * snackbar.show('Statement available');
 * 
 * // Success with message
 * snackbar.success('Transfer successful', 'Money sent to Savings');
 * 
 * // Error with custom duration
 * snackbar.error('Transaction failed', 'Please check your balance', { duration: 5000 });
 * 
 * // Warning with action
 * snackbar.warning('Connectivity unstable', 'Data may not be synced', {
 *   actionText: 'Retry',
 *   onActionPress: () => retrySync()
 * });
 * ```
 */
export function useSnackbar() {
    const context = useContext(SnackbarContext);

    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }

    const { showSnackbar, hideSnackbar } = context;

    /**
     * Show a snackbar with custom options
     */
    const show = (
        title: string,
        message?: string,
        options?: {
            type?: SnackbarType;
            duration?: number;
            actionText?: string;
            onActionPress?: () => void;
        }
    ) => {
        showSnackbar(title, {
            message,
            type: options?.type || 'info',
            duration: options?.duration,
            actionText: options?.actionText,
            onActionPress: options?.onActionPress,
        });
    };

    /**
     * Show a success snackbar
     */
    const success = (
        title: string,
        message?: string,
        options?: {
            duration?: number;
            actionText?: string;
            onActionPress?: () => void;
        }
    ) => {
        showSnackbar(title, {
            message,
            type: 'success',
            duration: options?.duration,
            actionText: options?.actionText,
            onActionPress: options?.onActionPress,
        });
    };

    /**
     * Show an error snackbar
     */
    const error = (
        title: string,
        message?: string,
        options?: {
            duration?: number;
            actionText?: string;
            onActionPress?: () => void;
        }
    ) => {
        showSnackbar(title, {
            message,
            type: 'error',
            duration: options?.duration,
            actionText: options?.actionText,
            onActionPress: options?.onActionPress,
        });
    };

    /**
     * Show a warning snackbar
     */
    const warning = (
        title: string,
        message?: string,
        options?: {
            duration?: number;
            actionText?: string;
            onActionPress?: () => void;
        }
    ) => {
        showSnackbar(title, {
            message,
            type: 'warning',
            duration: options?.duration,
            actionText: options?.actionText,
            onActionPress: options?.onActionPress,
        });
    };

    /**
     * Show an info snackbar
     */
    const info = (
        title: string,
        message?: string,
        options?: {
            duration?: number;
            actionText?: string;
            onActionPress?: () => void;
        }
    ) => {
        showSnackbar(title, {
            message,
            type: 'info',
            duration: options?.duration,
            actionText: options?.actionText,
            onActionPress: options?.onActionPress,
        });
    };

    return {
        show,
        success,
        error,
        warning,
        info,
        hide: hideSnackbar,
    };
}

/**
 * Helper functions for common snackbar patterns
 */
export const SnackbarHelpers = {
    /**
     * Show a success snackbar for saved data
     */
    saved: (snackbar: ReturnType<typeof useSnackbar>, itemName: string = 'Data') => {
        snackbar.success(`${itemName} tersimpan`, 'Perubahan berhasil disimpan');
    },

    /**
     * Show an error snackbar for network issues
     */
    networkError: (snackbar: ReturnType<typeof useSnackbar>) => {
        snackbar.error('Koneksi gagal', 'Periksa koneksi internet Anda');
    },

    /**
     * Show a warning snackbar for unsaved changes
     */
    unsavedChanges: (snackbar: ReturnType<typeof useSnackbar>, onDiscard: () => void) => {
        snackbar.warning('Perubahan belum disimpan', 'Data akan hilang jika tidak disimpan', {
            actionText: 'Buang',
            onActionPress: onDiscard,
        });
    },

    /**
     * Show an info snackbar for sync status
     */
    syncing: (snackbar: ReturnType<typeof useSnackbar>) => {
        snackbar.info('Menyinkronkan data', 'Mohon tunggu sebentar', {
            duration: 2000,
        });
    },
};
