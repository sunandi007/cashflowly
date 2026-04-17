import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";
import { NotificationService } from "@/services/NotificationService";

export function useTransactionMutations() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user?.id;

  // 🛠️ Helper untuk me-refresh semua data yang terpengaruh
  const invalidateAllData = () => {
    // Daftar semua query key yang perlu di-refresh
    const keysToInvalidate = [
      ["transactions", userId],   // List Transaksi Utama
      ["wallets", userId],        // Saldo Dompet
      ["upcomingBills", userId],  // List Tagihan Berulang
      ["billsSummary", userId],   // Card Ringkasan Tagihan
      ["analytics", userId],      // Grafik Bar Chart
      ["keyMetrics", userId],     // Ringkasan Net Income
      ["analytics-pie", userId],  // Pie Chart Kategori
    ];

    keysToInvalidate.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  };

  // Sync bill reminders after any mutation (fire and forget)
  const syncBillNotifications = () => {
    if (!userId) return;
    NotificationService.scheduleBillReminders(userId).catch(() => {
      // Non-critical: ignore scheduling errors silently
    });
  };

  // 🟢 CREATE
  const createTransaction = useMutation({
    mutationFn: async (payload: any) => {
      // Pisahkan tag_ids jika dikirim dari form (agar tidak error di Supabase)
      // txData adalah sisa data yang bersih untuk tabel 'transactions'
      const { tag_ids, ...txData } = payload;

      // 1. Insert Transaksi Utama
      const { data, error } = await supabase
        .from("transactions")
        .insert(txData)
        .select()
        .single();

      if (error) throw error;

      // 2. Insert Tags (Jika fitur tag sudah aktif & tabel transaction_tags ada)
      if (tag_ids && tag_ids.length > 0 && data) {
        const tagInserts = tag_ids.map((tagId: string) => ({
          transaction_id: data.id,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from("transaction_tags")
          .insert(tagInserts);

        if (tagError) console.error("Error inserting tags:", tagError);
      }

      return data;
    },
    onSuccess: () => {
      invalidateAllData();
      syncBillNotifications();
    },
    onError: (err: any) => {
      throw new Error(err.message);
    },
  });

  // 🟡 UPDATE
  const updateTransaction = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Pisahkan tag_ids dari updates
      const { tag_ids, ...txUpdates } = updates;

      const { data, error } = await supabase
        .from("transactions")
        .update(txUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // 🟢 Update tags: Delete old tags and insert new ones
      if (tag_ids !== undefined) {
        // 1. Delete all existing tags for this transaction
        const { error: deleteError } = await supabase
          .from("transaction_tags")
          .delete()
          .eq("transaction_id", id);

        if (deleteError) console.error("Error deleting old tags:", deleteError);

        // 2. Insert new tags if any
        if (tag_ids && tag_ids.length > 0) {
          const tagInserts = tag_ids.map((tagId: string) => ({
            transaction_id: id,
            tag_id: tagId,
          }));

          const { error: insertError } = await supabase
            .from("transaction_tags")
            .insert(tagInserts);

          if (insertError) console.error("Error inserting new tags:", insertError);
        }
      }

      return data;
    },
    onSuccess: () => {
      invalidateAllData();
      syncBillNotifications();
    },
    onError: (err: any) => {
      throw new Error(err.message);
    },
  });

  // 🔴 DELETE
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      invalidateAllData();
      syncBillNotifications();
    },
    onError: (err: any) => {
      throw new Error(err.message);
    },
  });

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    // Ekspor status loading gabungan jika perlu
    isMutating: createTransaction.isPending || updateTransaction.isPending || deleteTransaction.isPending
  };
}