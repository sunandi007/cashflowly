import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

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

      // Catatan: Logic update tags lebih kompleks (delete old -> insert new),
      // bisa ditambahkan nanti jika fitur tag sudah full.

      return data;
    },
    onSuccess: () => {
      invalidateAllData();
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