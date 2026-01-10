import React, { createContext, useState, useCallback } from 'react';
import Snackbar, { SnackbarType } from '@/components/Snackbar';

interface SnackbarOptions {
    type?: SnackbarType;
    message?: string;
    duration?: number;
    actionText?: string;
    onActionPress?: () => void;
}

interface SnackbarConfig {
    title: string;
    message?: string;
    type: SnackbarType;
    duration: number;
    actionText?: string;
    onActionPress?: () => void;
}

interface SnackbarContextType {
    showSnackbar: (title: string, options?: SnackbarOptions) => void;
    hideSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType>({
    showSnackbar: () => { },
    hideSnackbar: () => { },
});

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<SnackbarConfig>({
        title: '',
        message: '',
        type: 'info',
        duration: 4000,
    });
    const [queue, setQueue] = useState<SnackbarConfig[]>([]);

    const hideSnackbar = useCallback(() => {
        setVisible(false);

        // Show next snackbar in queue after animation completes
        setTimeout(() => {
            setQueue((currentQueue) => {
                if (currentQueue.length > 0) {
                    const [next, ...rest] = currentQueue;
                    setConfig(next);
                    setVisible(true);
                    return rest;
                }
                return currentQueue;
            });
        }, 300);
    }, []);

    const showSnackbar = useCallback(
        (title: string, options?: SnackbarOptions) => {
            const newConfig: SnackbarConfig = {
                title,
                message: options?.message,
                type: options?.type || 'info',
                duration: options?.duration !== undefined ? options.duration : 4000,
                actionText: options?.actionText,
                onActionPress: options?.onActionPress,
            };

            if (visible) {
                // If a snackbar is already visible, add to queue
                setQueue((currentQueue) => [...currentQueue, newConfig]);
            } else {
                // Show immediately
                setConfig(newConfig);
                setVisible(true);
            }
        },
        [visible]
    );

    return (
        <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
            {children}
            <Snackbar
                visible={visible}
                type={config.type}
                title={config.title}
                message={config.message}
                duration={config.duration}
                onDismiss={hideSnackbar}
                actionText={config.actionText}
                onActionPress={config.onActionPress}
            />
        </SnackbarContext.Provider>
    );
}
