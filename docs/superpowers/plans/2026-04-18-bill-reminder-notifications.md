# Bill Reminder Notifications — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Jadwalkan notifikasi lokal H-2, H-1, dan H-0 jam 09:00 untuk setiap tagihan berulang (recurring transaction) aktif milik user.

**Architecture:** Extend `NotificationService` dengan method `scheduleBillReminders(userId)` yang query Supabase, hitung offset H-2/H-1/H-0, lalu schedule via `expo-notifications`. Trigger dipanggil saat app dibuka (`useBillNotificationSync` di Dashboard) dan setiap kali mutasi transaksi selesai (`useTransactionMutations`). Tap notifikasi menyimpan `pendingRoute` di `NotificationContext`, yang dikonsumsi `RootNavigation` untuk navigate ke `BillsScreen`.

**Tech Stack:** `expo-notifications`, `date-fns`, TanStack Query, Supabase JS v2, React Native

---

## File Map

| Aksi | File |
|---|---|
| Modify | `src/services/NotificationService.ts` |
| **Create** | `src/hooks/useBillNotificationSync.ts` |
| Modify | `src/hooks/useTransactionMutations.ts` |
| Modify | `src/contexts/NotificationContext.tsx` |
| Modify | `src/screens/Dashboard.tsx` |
| Modify | `src/navigation/RootNavigation.tsx` |

---

## Task 1: Extend NotificationService — cancelBillReminders & scheduleBillReminders

**Files:**
- Modify: `src/services/NotificationService.ts`

- [ ] **Step 1: Tambah import `date-fns` dan `supabase` di bagian atas file**

  Tambahkan import berikut tepat setelah baris import yang sudah ada:

  ```ts
  import { addDays, startOfDay, isBefore } from 'date-fns';
  import { supabase } from '@/services/supabaseClient';
  ```

- [ ] **Step 2: Tambah tipe lokal `RecurringBillForNotif`**

  Tambahkan tepat sebelum `export class NotificationService {`:

  ```ts
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
  ```

- [ ] **Step 3: Tambah Android channel `bill_reminders` ke dalam `requestPermissions()`**

  Di dalam `requestPermissions()`, setelah block channel `'default'` yang sudah ada, tambahkan:

  ```ts
  await Notifications.setNotificationChannelAsync('bill_reminders', {
    name: 'Pengingat Tagihan',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 300, 200, 300],
    lightColor: '#FF4D4D',
    sound: 'default',
  });
  ```

- [ ] **Step 4: Tambah method `cancelBillReminders()` di dalam class**

  Tambahkan method ini di dalam `NotificationService`, setelah method `cancelDailyReminder()` yang sudah ada:

  ```ts
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
  ```

- [ ] **Step 5: Tambah method `scheduleBillReminders(userId)` di dalam class**

  Tambahkan method ini setelah `cancelBillReminders()`:

  ```ts
  /**
   * Schedule H-2, H-1, H-0 reminders at 09:00 for all active recurring bills.
   * @param userId - The authenticated user's ID
   */
  static async scheduleBillReminders(userId: string): Promise<void> {
    try {
      // 1. Cancel existing bill reminders
      await this.cancelBillReminders();

      // 2. Query active recurring bills
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
  ```

- [ ] **Step 6: Commit**

  ```
  git add src/services/NotificationService.ts
  git commit -m "feat(notifications): add cancelBillReminders and scheduleBillReminders"
  ```

---

## Task 2: Buat Hook `useBillNotificationSync`

**Files:**
- Create: `src/hooks/useBillNotificationSync.ts`

- [ ] **Step 1: Buat file baru `src/hooks/useBillNotificationSync.ts`**

  ```ts
  import { useEffect } from 'react';
  import { useAuth } from '@/hooks/useAuth';
  import { useNotification } from '@/hooks/useNotification';
  import { NotificationService } from '@/services/NotificationService';

  /**
   * Syncs bill reminders with the OS notification scheduler.
   * Mount this hook ONCE in Dashboard.tsx.
   * Re-schedules all bill notifications when user session is ready
   * and notification permission has been granted.
   */
  export function useBillNotificationSync(): void {
    const { session } = useAuth();
    const { hasPermission } = useNotification();
    const userId = session?.user?.id;

    useEffect(() => {
      if (!userId || !hasPermission) return;
      NotificationService.scheduleBillReminders(userId);
    }, [userId, hasPermission]);
  }
  ```

- [ ] **Step 2: Commit**

  ```
  git add src/hooks/useBillNotificationSync.ts
  git commit -m "feat(notifications): add useBillNotificationSync hook"
  ```

---

## Task 3: Mount Hook di Dashboard

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Tambah import di Dashboard**

  Tambahkan import setelah baris import `useTheme`:

  ```ts
  import { useBillNotificationSync } from '@/hooks/useBillNotificationSync';
  ```

- [ ] **Step 2: Panggil hook di dalam `DashboardScreen`**

  Di dalam fungsi `DashboardScreen`, tambahkan satu baris setelah deklarasi `const { colors, ... } = useTheme()`:

  ```ts
  // Sync bill reminders with OS on every app open
  useBillNotificationSync();
  ```

- [ ] **Step 3: Commit**

  ```
  git add src/screens/Dashboard.tsx
  git commit -m "feat(notifications): mount useBillNotificationSync in DashboardScreen"
  ```

---

## Task 4: Trigger Sync Setelah Mutasi Transaksi

**Files:**
- Modify: `src/hooks/useTransactionMutations.ts`

- [ ] **Step 1: Import `NotificationService`**

  Tambahkan import setelah baris import `useAuth`:

  ```ts
  import { NotificationService } from '@/services/NotificationService';
  ```

- [ ] **Step 2: Tambah helper `syncBillNotifications` di dalam hook**

  Tambahkan tepat setelah deklarasi `invalidateAllData`:

  ```ts
  // Sync bill reminders after any mutation (fire and forget)
  const syncBillNotifications = () => {
    if (!userId) return;
    NotificationService.scheduleBillReminders(userId).catch(() => {
      // Non-critical: ignore scheduling errors silently
    });
  };
  ```

- [ ] **Step 3: Panggil `syncBillNotifications()` di `onSuccess` semua 3 mutation**

  Update `createTransaction.onSuccess`:
  ```ts
  onSuccess: () => {
    invalidateAllData();
    syncBillNotifications();
  },
  ```

  Update `updateTransaction.onSuccess`:
  ```ts
  onSuccess: () => {
    invalidateAllData();
    syncBillNotifications();
  },
  ```

  Update `deleteTransaction.onSuccess`:
  ```ts
  onSuccess: () => {
    invalidateAllData();
    syncBillNotifications();
  },
  ```

- [ ] **Step 4: Commit**

  ```
  git add src/hooks/useTransactionMutations.ts
  git commit -m "feat(notifications): re-sync bill reminders after every transaction mutation"
  ```

---

## Task 5: Tambah pendingRoute ke NotificationContext

**Files:**
- Modify: `src/contexts/NotificationContext.tsx`

- [ ] **Step 1: Update `NotificationContextType` interface**

  Tambahkan 2 field baru ke interface `NotificationContextType`:

  ```ts
  pendingRoute: string | null;
  clearPendingRoute: () => void;
  ```

- [ ] **Step 2: Tambah state `pendingRoute` di `NotificationProvider`**

  Di dalam `NotificationProvider`, tambahkan state baru setelah `const [isLoading, setIsLoading] = useState(true)`:

  ```ts
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  ```

- [ ] **Step 3: Extend `addNotificationResponseReceivedListener` untuk Bill Reminder**

  Di dalam `setupNotificationListeners()`, update `responseListener.current` menjadi:

  ```ts
  responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'bill_reminder' && data?.screen) {
      setPendingRoute(data.screen as string);
    }
  });
  ```

- [ ] **Step 4: Tambah `clearPendingRoute` function**

  Tambahkan setelah `getScheduledNotifications`:

  ```ts
  const clearPendingRoute = () => {
    setPendingRoute(null);
  };
  ```

- [ ] **Step 5: Expose di objek `value`**

  Update objek `value` yang dikembalikan provider:

  ```ts
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
  ```

- [ ] **Step 6: Commit**

  ```
  git add src/contexts/NotificationContext.tsx
  git commit -m "feat(notifications): add pendingRoute state for bill reminder tap navigation"
  ```

---

## Task 6: Consume pendingRoute di RootNavigation

**Files:**
- Modify: `src/navigation/RootNavigation.tsx`

- [ ] **Step 1: Import tambahan yang dibutuhkan**

  Tambahkan import berikut di `src/navigation/RootNavigation.tsx`:

  ```ts
  import { useEffect } from 'react';
  import { useNotification } from '@/hooks/useNotification';
  ```

- [ ] **Step 2: Tambah useEffect di dalam `MainTabs` untuk consume pendingRoute**

  Di dalam `function MainTabs()`, tambahkan import `useNavigation` lokal dan useEffect **tepat setelah** `const { colors } = useTheme()`:

  ```ts
  function MainTabs() {
    const { colors } = useTheme();

    // Handle notification tap navigation
    const { pendingRoute, clearPendingRoute } = useNotification();
    const navigation = useNavigation<any>();

    useEffect(() => {
      if (!pendingRoute) return;
      navigation.navigate(pendingRoute);
      clearPendingRoute();
    }, [pendingRoute]);

    // ... sisa kode yang sudah ada tetap tidak berubah
  ```

  > `useNavigation` sudah diimport di file ini dari `@react-navigation/native` — tidak perlu tambah import ulang jika sudah ada. Jika belum ada, tambahkan:
  > ```ts
  > import { useNavigation } from '@react-navigation/native';
  > ```

- [ ] **Step 3: Commit**

  ```
  git add src/navigation/RootNavigation.tsx
  git commit -m "feat(notifications): navigate to BillsScreen on bill reminder notification tap"
  ```

---

## Task 7: Manual Smoke Test

- [ ] **Step 1: Verifikasi notifikasi terschedule**

  Buka app di Expo Go. Buka `NotificationSettingsScreen` → lihat scheduled notifications.
  Harus ada entries dengan `data.type === 'bill_reminder'` untuk setiap tagihan aktif yang `next_due_date`-nya belum lewat.

- [ ] **Step 2: Verifikasi sync setelah mutasi**

  Tambahkan transaksi baru dengan `is_recurring = true`. Check kembali scheduled notifications — harus ada entries baru untuk transaksi ini.

- [ ] **Step 3: Verifikasi tidak ada crash**

  Pastikan tidak ada error di Metro console saat:
  - App dibuka pertama kali
  - Transaksi ditambahkan/diedit/dihapus
  - App dibuka tanpa koneksi internet (scheduleBillReminders harus silent fail, tidak crash)

---

## Self-Review

- [x] Spec coverage lengkap: H-2/H-1/H-0, jam 09:00, skip past dates, channel Android, payload data, trigger on open + mutation, tap navigation
- [x] No placeholders
- [x] Type consistency: `RecurringBillForNotif`, `pendingRoute: string | null`, `clearPendingRoute: () => void` konsisten di semua task
- [x] Menggunakan `date-fns` sesuai project rules
- [x] Error handling: semua async function dibungkus try/catch
- [x] Tidak ada `.select('*')` — kolom spesifik yang diambil
