// src/hooks/usePieChartAnalytics.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { getDateRange } from "@/utils/getDateRange";
import { getDateRangeAnalitic } from "@/utils/getDateRangeAnalitic";
// --- TIPE DATA ---
export type PieChartData = {
  name: string;
  value: number; // Total expense amount
  color: string;
};

type CategoryDetails = {
  name: string;
  bgColor: string;
};

type TransactionRowWithCategory = {
  amount: number;
  type: "income" | "expense";
  categories: CategoryDetails | null;
};

// --- HOOK PIE CHART ---
// Menerima periode (misalnya, "month") untuk menentukan rentang data mentah
export function usePieChartAnalytics(userId?: string, period: "weekly" | "monthly" | "yearly" | "all" = "monthly") {
  return useQuery({
    queryKey: ["analytics-pie", userId, period],
    queryFn: async () => {
      if (!userId) return [];

      const { start: rangeStart, end: rangeEnd } = getDateRangeAnalitic(period, "current");

      // Dapatkan range untuk periode (asumsi getDateRange ada di utilitas)
      // *Anda perlu menentukan utilitas yang bisa mendapatkan range berdasarkan "week"/"month"*
      // Simpanan: Kita ambil data 30 hari terakhir untuk distribusi.
      const now = new Date();
      const start = new Date();
      start.setDate(now.getDate() - (period === 'weekly' ? 7 : 30));
      // const rangeStart = start.toISOString().split('T')[0];
      // const rangeEnd = now.toISOString().split('T')[0];
      
      // Query dengan JOIN categories dan filter EXPENSE
      const { data: rawData, error } = await supabase
        .from("transactions")
        .select("amount, type, categories(name, bgColor)") // Hanya select field yang dibutuhkan
        .eq("user_id", userId)
        .eq("type", "expense") // Filter hanya pengeluaran
        .is("transfer_id", null)
        .gte("date", rangeStart)
        .lte("date", rangeEnd);

      if (error) throw error;
      const transactions = rawData as any[];

      // --- AGREGASI UNTUK PIE CHART ---
      const categoryMap = new Map<string, { value: number; color: string }>();

      transactions.forEach(t => {
          if (t.categories) {
              const catName = t.categories.name;
              const catColor = t.categories.bgColor || '#cccccc';
              const amount = Number(t.amount);

              const current = categoryMap.get(catName) || { value: 0, color: catColor };
              current.value += amount;
              categoryMap.set(catName, current);
          }
      });

      return Array.from(categoryMap.entries())
          .map(([name, data]) => ({ name: name, value: data.value, color: data.color }))
          .sort((a, b) => b.value - a.value); // Urutkan dari pengeluaran terbesar
    },
    enabled: !!userId,
  });
}