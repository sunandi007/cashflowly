import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export class NotificationService {
    /**
     * Request notification permissions from user
     */
    static async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            console.warn('Notifications only work on physical devices');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get notification permissions');
            return false;
        }

        // Configure Android notification channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4ADE80',
            });
        }

        return true;
    }

    /**
     * Schedule daily expense reminder
     * @param hour - Hour to send notification (0-23)
     * @param minute - Minute to send notification (0-59)
     * @param days - Array of days to send (0=Sunday, 1=Monday, ..., 6=Saturday)
     */
    static async scheduleDailyReminder(
        hour: number = 20,
        minute: number = 0,
        days: number[] = [1, 2, 3, 4, 5, 6, 0] // All days by default
    ): Promise<string | null> {
        try {
            // Cancel existing daily reminders first
            await this.cancelDailyReminder();

            // Create trigger object with required type field
            const trigger: Notifications.DailyTriggerInput = {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
                channelId: 'default', // Required for Android
            };

            // Schedule for each selected day
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '📝 Jangan Lupa Catat Pengeluaran!',
                    body: 'Sudah catat pengeluaran hari ini? Tap untuk menambahkan transaksi',
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.DEFAULT,
                    data: { type: 'daily_reminder', screen: 'Transaction' },
                },
                trigger,
            });

            console.log('Daily reminder scheduled with ID:', notificationId);
            return notificationId;
        } catch (error) {
            console.error('Error scheduling daily reminder:', error);
            return null;
        }
    }

    /**
     * Cancel daily reminder notification
     */
    static async cancelDailyReminder(): Promise<void> {
        try {
            // Get all scheduled notifications
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

            // Filter daily reminder notifications
            const dailyReminders = scheduledNotifications.filter(
                (notif) => notif.content.data?.type === 'daily_reminder'
            );

            // Cancel each daily reminder
            for (const notif of dailyReminders) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }

            console.log('Daily reminders cancelled');
        } catch (error) {
            console.error('Error cancelling daily reminder:', error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    static async cancelAllNotifications(): Promise<void> {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
            console.log('All notifications cancelled');
        } catch (error) {
            console.error('Error cancelling all notifications:', error);
        }
    }

    /**
     * Get all scheduled notifications
     */
    static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
        try {
            return await Notifications.getAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Error getting scheduled notifications:', error);
            return [];
        }
    }

    /**
     * Send test notification immediately
     */
    static async sendTestNotification(): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '✅ Notifikasi Test',
                    body: 'Notifikasi berhasil berfungsi!',
                    sound: true,
                    data: { type: 'test' },
                },
                trigger: null, // Send immediately
            });
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    }

    /**
     * Check if notification permissions are granted
     */
    static async hasPermissions(): Promise<boolean> {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted';
    }

    /**
     * Get Expo Push Token (for Phase 2 - Push Notifications)
     */
    static async getExpoPushToken(): Promise<string | null> {
        try {
            if (!Device.isDevice) {
                console.warn('Push tokens only work on physical devices');
                return null;
            }

            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.warn('No projectId found for push notifications');
                return null;
            }

            const token = await Notifications.getExpoPushTokenAsync({
                projectId,
            });

            return token.data;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }
}
