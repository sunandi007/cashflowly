import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { addDays, startOfDay, isBefore } from 'date-fns';
import { supabase } from '@/services/supabaseClient';

interface RecurringBillForNotif {
  id: string;
  next_due_date: string | null;
  note: string | null;
  amount: number;
  end_condition: string;
  end_value: string | null;
  transaction_count: number;
  categories: { name: string } | null;
}

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

        // Configure Android notification channels
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#4ADE80',
            });
            await Notifications.setNotificationChannelAsync('bill_reminders', {
                name: 'Pengingat Tagihan',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 300, 200, 300],
                lightColor: '#FF4D4D',
                sound: 'default',
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
     * Cancel all scheduled bill reminder notifications
     */
    static async cancelBillReminders(): Promise<void> {
        try {
            const scheduled = await Notifications.getAllScheduledNotificationsAsync();
            const billReminders = scheduled.filter(
                (n) => n.content.data?.type === 'bill_reminder'
            );
            for (const n of billReminders) {
                await Notifications.cancelScheduledNotificationAsync(n.identifier);
            }
        } catch (error) {
            console.error('Error cancelling bill reminders:', error);
        }
    }

    /**
     * Schedule H-2, H-1, H-0 reminders at 09:00 for all active recurring bills.
     * @param userId - The authenticated user's ID
     */
    static async scheduleBillReminders(userId: string): Promise<void> {
        try {
            // 1. Cancel existing bill reminders
            await this.cancelBillReminders();

            // 2. Query active recurring bills from Supabase
            const { data, error } = await supabase
                .from('transactions')
                .select(
                    'id, next_due_date, note, amount, end_condition, end_value, transaction_count, categories(name)'
                )
                .eq('user_id', userId)
                .eq('is_recurring', true);

            if (error) {
                console.error('Error fetching bills for notification:', error);
                return;
            }

            if (!data || data.length === 0) return;

            const bills = data as unknown as RecurringBillForNotif[];

            // 3. Filter only active bills (same logic as useUpcomingBills)
            const activeBills = bills.filter((bill) => {
                if (bill.end_condition === 'never' || bill.end_condition === 'until_date') {
                    return true;
                }
                if (bill.end_condition === 'after_count') {
                    const target = Number(bill.end_value);
                    const current = Number(bill.transaction_count) || 0;
                    return current < target;
                }
                return true;
            });

            const today = startOfDay(new Date());

            // 4. Schedule notifications for each active bill
            for (const bill of activeBills) {
                if (!bill.next_due_date) continue;

                const categoryName = bill.categories?.name ?? 'Tagihan';
                const dueDate = startOfDay(new Date(bill.next_due_date));

                const offsets: Array<{ days: number; title: string; body: string }> = [
                    {
                        days: -2,
                        title: '🔔 Tagihan Mendatang',
                        body: `${categoryName} perlu dibayar 2 hari lagi`,
                    },
                    {
                        days: -1,
                        title: '⚠️ Tagihan Jatuh Tempo Besok',
                        body: `${categoryName} jatuh tempo besok!`,
                    },
                    {
                        days: 0,
                        title: '🚨 Tagihan Jatuh Tempo Hari Ini',
                        body: `${categoryName} harus dibayar hari ini!`,
                    },
                ];

                for (const offset of offsets) {
                    const notifDate = addDays(dueDate, offset.days);

                    // Skip dates already in the past
                    if (isBefore(notifDate, today)) continue;

                    // Set trigger time to 09:00 AM
                    const triggerDate = new Date(notifDate);
                    triggerDate.setHours(9, 0, 0, 0);

                    const trigger: Notifications.DateTriggerInput = {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: triggerDate,
                        channelId: 'bill_reminders',
                    };

                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: offset.title,
                            body: offset.body,
                            sound: true,
                            priority: Notifications.AndroidNotificationPriority.HIGH,
                            data: {
                                type: 'bill_reminder',
                                screen: 'BillsScreen',
                                billId: bill.id,
                                offset: offset.days,
                            },
                        },
                        trigger,
                    });
                }
            }
        } catch (error) {
            console.error('Error scheduling bill reminders:', error);
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
