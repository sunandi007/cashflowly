import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/services/NotificationService';

// Storage keys
const STORAGE_KEYS = {
    NOTIFICATION_ENABLED: 'notification_daily_enabled',
    NOTIFICATION_TIME: 'notification_daily_time',
    NOTIFICATION_DAYS: 'notification_daily_days',
    PERMISSION_ASKED: 'notification_permission_asked',
};

// Types
export interface NotificationSettings {
    enabled: boolean;
    hour: number;
    minute: number;
    days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

interface NotificationContextType {
    settings: NotificationSettings;
    hasPermission: boolean;
    isLoading: boolean;
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
    requestPermission: () => Promise<boolean>;
    sendTestNotification: () => Promise<void>;
    getScheduledNotifications: () => Promise<Notifications.NotificationRequest[]>;
    pendingRoute: string | null;
    clearPendingRoute: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default settings
const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: false,
    hour: 19, // 7 PM
    minute: 0,
    days: [1, 2, 3, 4, 5, 6, 0], // All days
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
    const [hasPermission, setHasPermission] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    // Load settings from storage on mount
    useEffect(() => {
        loadSettings();
        checkPermissions();
        setupNotificationListeners();

        // Cleanup listeners on unmount
        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    // Setup notification response listeners
    const setupNotificationListeners = () => {
        // This listener is triggered when a notification is received while the app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
        });

        // This listener is triggered when a user taps on or interacts with a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            if (data?.type === 'bill_reminder' && data?.screen) {
                setPendingRoute(data.screen as string);
            }
        });
    };

    // Load settings from AsyncStorage
    const loadSettings = async () => {
        try {
            const [enabled, timeStr, daysStr] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_ENABLED),
                AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TIME),
                AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_DAYS),
            ]);

            const loadedSettings: NotificationSettings = {
                enabled: enabled === 'true',
                hour: timeStr ? parseInt(timeStr.split(':')[0]) : DEFAULT_SETTINGS.hour,
                minute: timeStr ? parseInt(timeStr.split(':')[1]) : DEFAULT_SETTINGS.minute,
                days: daysStr ? JSON.parse(daysStr) : DEFAULT_SETTINGS.days,
            };

            setSettings(loadedSettings);

            // Re-schedule if enabled
            if (loadedSettings.enabled) {
                await NotificationService.scheduleDailyReminder(
                    loadedSettings.hour,
                    loadedSettings.minute,
                    loadedSettings.days
                );
            }
        } catch (error) {
            console.error('Error loading notification settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Check notification permissions
    const checkPermissions = async () => {
        const granted = await NotificationService.hasPermissions();
        setHasPermission(granted);
    };

    // Request notification permission
    const requestPermission = async (): Promise<boolean> => {
        try {
            const granted = await NotificationService.requestPermissions();
            setHasPermission(granted);

            // Mark that we've asked for permission
            await AsyncStorage.setItem(STORAGE_KEYS.PERMISSION_ASKED, 'true');

            return granted;
        } catch (error) {
            console.error('Error requesting permissions:', error);
            return false;
        }
    };

    // Update notification settings
    const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
        try {
            const updatedSettings = { ...settings, ...newSettings };
            setSettings(updatedSettings);

            // Save to AsyncStorage
            await Promise.all([
                AsyncStorage.setItem(
                    STORAGE_KEYS.NOTIFICATION_ENABLED,
                    updatedSettings.enabled.toString()
                ),
                AsyncStorage.setItem(
                    STORAGE_KEYS.NOTIFICATION_TIME,
                    `${updatedSettings.hour}:${updatedSettings.minute}`
                ),
                AsyncStorage.setItem(
                    STORAGE_KEYS.NOTIFICATION_DAYS,
                    JSON.stringify(updatedSettings.days)
                ),
            ]);

            // Update scheduled notifications
            if (updatedSettings.enabled && hasPermission) {
                await NotificationService.scheduleDailyReminder(
                    updatedSettings.hour,
                    updatedSettings.minute,
                    updatedSettings.days
                );
            } else {
                await NotificationService.cancelDailyReminder();
            }
        } catch (error) {
            console.error('Error updating notification settings:', error);
            throw error;
        }
    };

    // Send test notification
    const sendTestNotification = async () => {
        await NotificationService.sendTestNotification();
    };

    // Get scheduled notifications
    const getScheduledNotifications = async () => {
        return await NotificationService.getScheduledNotifications();
    };

    const clearPendingRoute = () => {
        setPendingRoute(null);
    };

    const value: NotificationContextType = {
        settings,
        hasPermission,
        isLoading,
        updateSettings,
        requestPermission,
        sendTestNotification,
        getScheduledNotifications,
        pendingRoute,
        clearPendingRoute,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use notification context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};
