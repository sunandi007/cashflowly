# Design Spec: Bill Reminder Notifications

**Date:** 2026-04-18  
**Status:** Approved  
**Author:** AI + Sunandi

---

## Overview

Menambahkan fitur notifikasi pengingat otomatis untuk tagihan berulang (*recurring transactions*). Notifikasi akan dikirim pada H-2, H-1, dan H-0 (hari jatuh tempo) setiap pukul 09:00 pagi, menggunakan Local Scheduled Notifications via `expo-notifications` — mekanisme yang sama dengan daily reminder jam 7 malam yang sudah berjalan.

---

## Keputusan Desain

| Item | Keputusan |
|---|---|
| Mekanisme | Local Scheduled Notifications (expo-notifications) |
| Waktu notifikasi | Jam 09:00 setiap hari (H-2, H-1, H-0) |
| Trigger rescheduling | App dibuka (on mount) + setelah mutasi transaksi |
| Aksi tap notifikasi | Navigate ke BillsScreen |
| Pendekatan arsitektur | Extend NotificationService (Pendekatan A) |

---

## Arsitektur

### Komponen yang Dimodifikasi

```
NotificationService.ts     ← Tambah 2 method baru
NotificationContext.tsx    ← Expose syncBillReminders + pendingRoute state
useTransactionMutations.ts ← Panggil sync setelah setiap onSuccess
```

### Komponen Baru

```
src/hooks/useBillNotificationSync.ts  ← Trigger on app startup
```

---

## Bagian 1: NotificationService

### `cancelBillReminders(): Promise<void>`
- Ambil semua scheduled notifications via `getAllScheduledNotificationsAsync()`
- Filter yang punya `data.type === 'bill_reminder'`
- Cancel satu per satu via `cancelScheduledNotificationAsync(id)`

### `scheduleBillReminders(userId: string): Promise<void>`

**Langkah-langkah:**

1. Panggil `cancelBillReminders()` — reset semua notifikasi tagihan yang ada
2. Query Supabase:
   ```ts
   supabase
     .from('transactions')
     .select('id, next_due_date, note, amount, end_condition, end_value, transaction_count, categories(name)')
     .eq('user_id', userId)
     .eq('is_recurring', true)
   ```
3. Filter tagihan aktif — логика sama dengan `useUpcomingBills`:
   - `end_condition === 'never'` → aktif
   - `end_condition === 'until_date'` → aktif
   - `end_condition === 'after_count'` → aktif jika `transaction_count < end_value`
4. Untuk setiap tagihan aktif yang punya `next_due_date`:
   - Hitung 3 tanggal: `next_due_date - 2`, `next_due_date - 1`, `next_due_date`
   - Skip tanggal yang sudah lewat (sebelum hari ini)
   - Schedule notifikasi jam 09:00 untuk setiap tanggal yang valid

**Konten notifikasi:**

| Offset | Title | Body |
|---|---|---|
| H-2 | `🔔 Tagihan Mendatang` | `[nama_kategori] perlu dibayar 2 hari lagi` |
| H-1 | `⚠️ Tagihan Jatuh Tempo Besok` | `[nama_kategori] jatuh tempo besok!` |
| H-0 | `🚨 Tagihan Jatuh Tempo Hari Ini` | `[nama_kategori] harus dibayar hari ini!` |

**Data payload setiap notifikasi:**
```ts
data: {
  type: 'bill_reminder',
  screen: 'Bills',
  billId: bill.id,
  offset: -2 | -1 | 0,
}
```

**Android Channel:** Gunakan channel `'bill_reminders'` dengan importance `HIGH` dan vibration pattern.

---

## Bagian 2: Trigger Points

### Trigger 1 — App Startup (`useBillNotificationSync`)

File baru: `src/hooks/useBillNotificationSync.ts`

```ts
// Dipanggil sekali dari Dashboard.tsx
export function useBillNotificationSync() {
  const { session } = useAuth();
  const { hasPermission } = useNotification();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId || !hasPermission) return;
    NotificationService.scheduleBillReminders(userId);
  }, [userId, hasPermission]);
}
```

Hook ini di-mount di `Dashboard.tsx` (screen yang selalu aktif setelah login).

### Trigger 2 — After Mutation (`useTransactionMutations`)

Tambah helper `syncBillNotifications()` di `useTransactionMutations`:
```ts
const syncBillNotifications = async () => {
  if (!userId) return;
  await NotificationService.scheduleBillReminders(userId);
};
```

Panggil `syncBillNotifications()` di `onSuccess` semua 3 mutation:
- `createTransaction.onSuccess`
- `updateTransaction.onSuccess`
- `deleteTransaction.onSuccess`

> Re-sync selalu dilakukan tanpa cek `is_recurring` untuk mencegah stale schedules.

---

## Bagian 3: Notification Tap → Navigate ke Bills

### NotificationContext — Tambahan

Tambah ke `NotificationContextType`:
```ts
pendingRoute: string | null;
clearPendingRoute: () => void;
```

Di `setupNotificationListeners()`, extend listener yang sudah ada:
```ts
responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  if (data?.type === 'bill_reminder' && data?.screen) {
    setPendingRoute(data.screen as string);
  }
});
```

### Root Navigator — Consume pendingRoute

Di `App.tsx` atau root navigator, tambah `useEffect`:
```ts
useEffect(() => {
  if (pendingRoute && navigationRef.isReady()) {
    // Navigate ke tab Bills
    navigationRef.navigate('Main');
    // Setelah Main mounted, navigate ke Bills tab
    clearPendingRoute();
  }
}, [pendingRoute]);
```

> Implementasi detail navigasi ke tab Bills disesuaikan dengan struktur Bottom Tab Navigator yang ada.

---

## Batasan & Catatan

1. **User harus buka app minimal sekali** setelah tagihan dibuat agar notifikasi terschedule ke OS
2. Satu tagihan menghasilkan **maksimal 3 notifikasi** (H-2, H-1, H-0)
3. Jika `next_due_date` tidak ada di data (null/undefined), tagihan tersebut **dilewati** — tidak error
4. Notifikasi hanya dijadwalkan jika **permission sudah granted**
5. Deep navigation ke detail tagihan spesifik **tidak diimplementasikan** di iterasi ini (YAGNI)
6. String UI dalam i18n akan ditambahkan ke `en.json` dan `id.json` — notifikasi kontennya dalam **Bahasa Indonesia** (sesuai target pengguna)

---

## File yang Akan Diubah / Dibuat

| File | Aksi |
|---|---|
| `src/services/NotificationService.ts` | Modify — tambah 2 method |
| `src/contexts/NotificationContext.tsx` | Modify — tambah pendingRoute state |
| `src/hooks/useTransactionMutations.ts` | Modify — tambah sync setelah mutasi |
| `src/hooks/useBillNotificationSync.ts` | **Create baru** |
| `src/screens/Dashboard.tsx` | Modify — panggil useBillNotificationSync |
