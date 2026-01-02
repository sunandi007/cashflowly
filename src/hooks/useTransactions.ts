import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { getDateRange } from "@/utils/getDateRange";

/**
 * ✅ Hook untuk mengambil daftar transaksi (termasuk hasil sinkronisasi transfer)
 * - Kini menggunakan relasi ke tabel `transfers`
 */
export function useTransactions(
  userId?: string,
  period: "week" | "month" | "all" = "all"
) {
  return useQuery({
    queryKey: ["transactions", userId, period],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return [];
      const { start, end } = getDateRange(period);

      // 🔹 Ambil semua transaksi user
      let query = supabase
        .from("transactions")
        .select(
          `
          id,
          user_id,
          amount,
          type,
          note,
          date,
          category_id,
          description,
          wallet_id,
          transfer_id,
          created_at,
          updated_at,
          categories(name, icon, type, bgColor),
          wallet:wallets(name),
          transfers:transfer_id (
            id,
            amount,
            note,
            date,
            source_wallet:source_wallet_id(name),
            destination_wallet:destination_wallet_id(name)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (start && end) {
        query = query.gte("created_at", start).lte("created_at", end);
      }

      const { data, error } = await query;
      if (error) throw error;

      // 🔁 Gabungkan hasil mirror transaksi transfer menjadi satu
      return mergeTransfers(data || []);
    },
  });
}

/** 🔁 Gabungkan transaksi transfer agar hanya muncul satu item di UI */
function mergeTransfers(transactions: any[]) {
  const transferMap: Record<string, any> = {};
  const normalTx: any[] = [];

  for (const tx of transactions) {
    if (!tx.transfer_id) {
      // Transaksi Normal: Income atau Expense
      normalTx.push({ 
        ...tx, 
        is_transfer: false,
        // Konversi amount menjadi Number di sini untuk memastikan konsistensi tipe data
        amount: Number(tx.amount) || 0,
      });
      continue;
    }

    const t = tx.transfers;
    if (!transferMap[t.id]) {
      // Transaksi Transfer (Gabungan): Amoutnya sudah dari relasi transfers
      transferMap[t.id] = {
        id: `transfer-${t.id}`,
        transfer_id: t.id,
        type: "transfer",
        amount: Number(t.amount) || 0, // Konversi di sini juga
        note: t.note,
        date: t.date,
        from_wallet: t.source_wallet?.name,
        to_wallet: t.destination_wallet?.name,
        is_transfer: true,
      };
    }
  }

  const mergedTransfers = Object.values(transferMap);
  return [...mergedTransfers, ...normalTx].sort(
    (a, b) =>
      new Date(b.created_at || b.date).getTime() -
      new Date(a.created_at || a.date).getTime()
  );
}
