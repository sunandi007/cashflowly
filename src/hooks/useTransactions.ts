import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { getDateRange } from "@/utils/getDateRange";

export function useTransactions(
  userId?: string,
  period: "week" | "month" | "all" = "all"
) {
  return useQuery({
    queryKey: ["transactions", userId, period],
    queryFn: async () => {
      if (!userId) return [];
      const { start, end } = getDateRange(period);

      let query = supabase
        .from("transactions")
        .select(
          `
            *,
            categories(name, icon, type, bgColor),
            source_wallet:wallets!fk_source_wallet(name),
            destination_wallet:wallets!fk_destination_wallet(name),
            wallet:wallets!transactions_wallet_id_fkey(name)
            `
        )
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (start && end) {
        query = query.gte("date", start).lte("date", end);
      }

      const { data, error } = await query;
      if (error) throw error;

      // memastikan data terurut juga di sisi client
      const transactions = (data || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 🧠 Gabungkan transaksi transfer
      const merged = mergeTransfers(transactions);

      return merged;
    },
    enabled: !!userId,
  });
}

/** 🔁 Gabungkan transaksi transfer agar hanya muncul satu item */
function mergeTransfers(transactions: any[]) {
  const result: any[] = [];
  const usedIds = new Set();

  for (const tx of transactions) {
    if (!tx.is_transfer) {
      result.push(tx);
      continue;
    }

    if (usedIds.has(tx.id)) continue;

    // Cari pasangan transfer lawannya
    const pair = transactions.find(
      (t) =>
        t.is_transfer &&
        t.user_id === tx.user_id &&
        t.amount === tx.amount &&
        t.id !== tx.id &&
        t.type !== tx.type &&
        Math.abs(new Date(t.date).getTime() - new Date(tx.date).getTime()) <
          3000
    );

    // Ambil nama wallet asal dan tujuan
    const from_wallet =
      tx.type === "expense"
        ? tx.wallet?.name ||
          tx.source_wallet?.name ||
          pair?.wallet?.name ||
          "Unknown"
        : pair?.wallet?.name || pair?.source_wallet?.name || "Unknown";

    const to_wallet =
      tx.type === "income"
        ? tx.wallet?.name ||
          tx.destination_wallet?.name ||
          pair?.wallet?.name ||
          "Unknown"
        : pair?.wallet?.name || pair?.destination_wallet?.name || "Unknown";

    // Gabungkan menjadi satu transaksi transfer
    result.push({
      id: `transfer-${tx.id}`,
      type: "transfer",
      amount: tx.amount,
      note: tx.note,
      date: tx.date,
      from_wallet,
      to_wallet,
      is_transfer: true,
    });

    usedIds.add(tx.id);
    if (pair) usedIds.add(pair.id);
  }

  return result;
}
