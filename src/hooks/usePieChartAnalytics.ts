// src/hooks/usePieChartAnalytics.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { getDateRangeAnalitic } from "@/utils/getDateRangeAnalitic";

export type PieChartData = {
  name: string;
  value: number;
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

export function usePieChartAnalytics(userId?: string, period: "weekly" | "monthly" | "yearly" | "all" = "monthly") {
  return useQuery({
    queryKey: ["analytics-pie", userId, period],
    queryFn: async () => {
      if (!userId) return [];

      const { start, end } = getDateRangeAnalitic(period, "current");

      const { data: rawData, error } = await supabase
        .from("transactions")
        .select("amount, type, categories(name, bgColor)")
        .eq("user_id", userId)
        .eq("type", "expense")
        .is("transfer_id", null)
        .gte("date", start)
        .lte("date", end);

      if (error) throw error;
      const transactions = rawData as any[];

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