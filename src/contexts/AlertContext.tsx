import React, { createContext, useState, useCallback, useRef } from 'react';
import CustomAlert, { AlertType } from '@/components/CustomAlert';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface AlertContextType {
    showAlert: (
        title: string,
        message: string,
        buttons?: AlertButton[],
        options?: AlertOptions,
        icon?: boolean
    ) => void;
    hideAlert: () => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
    children: React.ReactNode;
}

export function AlertProvider({ children }: AlertProviderProps) {
    const [visible, setVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'info' as AlertType,
        title: '',
        message: '',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: undefined as (() => void) | undefined,
        onClose: undefined as (() => void) | undefined,
        icon: true,
    });

    // Use ref to track if there's a pending alert
    const pendingAlertRef = useRef<any>(null);

    const hideAlert = useCallback(() => {
        setVisible(false);
        // Check if there's a pending alert to show
        setTimeout(() => {
            if (pendingAlertRef.current) {
                const pending = pendingAlertRef.current;
                pendingAlertRef.current = null;
                showAlert(pending.title, pending.message, pending.buttons, pending.options, pending.icon);
            }
        }, 300); // Wait for animation to complete
    }, []);

    const showAlert = useCallback(
        (
            title: string,
            message: string,
            buttons?: AlertButton[],
            options?: AlertOptions,
            icon?: boolean
        ) => {
            // If an alert is already visible, queue this one
            if (visible) {
                pendingAlertRef.current = { title, message, buttons, options, icon };
                return;
            }

            let confirmText = 'OK';
            let cancelText = 'Cancel';
            let onConfirm: (() => void) | undefined;
            let onCancel: (() => void) | undefined;

            // If buttons are provided, use them (similar to Alert.alert API)
            if (buttons && buttons.length > 0) {
                // If there's only one button, use it as confirm
                if (buttons.length === 1) {
                    confirmText = buttons[0].text;
                    onConfirm = () => {
                        hideAlert();
                        buttons[0].onPress?.();
                    };
                } else {
                    // If there are two buttons, first is cancel, second is confirm
                    const cancelButton = buttons.find(b => b.style === 'cancel') || buttons[0];
                    const confirmButton = buttons.find(b => b.style !== 'cancel') || buttons[1];

                    cancelText = cancelButton.text;
                    confirmText = confirmButton.text;

                    onCancel = () => {
                        hideAlert();
                        cancelButton.onPress?.();
                    };

                    onConfirm = () => {
                        hideAlert();
                        confirmButton.onPress?.();
                    };
                }
            } else {
                // No buttons provided, use options
                confirmText = options?.confirmText || 'OK';
                cancelText = options?.cancelText || 'Cancel';

                onConfirm = options?.onConfirm
                    ? () => {
                        hideAlert();
                        options.onConfirm?.();
                    }
                    : undefined;

                onCancel = options?.onCancel
                    ? () => {
                        hideAlert();
                        options.onCancel?.();
                    }
                    : undefined;
            }

            // If no onConfirm is set, just close the alert
            if (!onConfirm) {
                onConfirm = hideAlert;
            }

            // If no onCancel is set, just close the alert
            const onClose = onCancel || hideAlert;

            setAlertConfig({
                type: options?.type || 'info',
                title,
                message,
                confirmText,
                cancelText,
                onConfirm,
                onClose,
                icon: icon !== undefined ? icon : true,
            });

            setVisible(true);
        },
        [visible, hideAlert]
    );

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
                onConfirm={alertConfig.onConfirm}
                onClose={alertConfig.onClose}
                icon={alertConfig.icon}
            />
        </AlertContext.Provider>
    );
}
