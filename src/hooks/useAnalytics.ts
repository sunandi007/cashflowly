import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { getDateRangeAnalitic } from "@/utils/getDateRangeAnalitic";

type FilterType = "weekly" | "monthly" | "yearly";

type TransactionRow = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category_id?: string;
};

export function useAnalytics(userId?: string, filter: FilterType = "weekly") {
  return useQuery({
    queryKey: ["analytics", userId, filter],
    queryFn: async () => {
      if (!userId) return [];

      const { start, end } = getDateRangeAnalitic(filter, 'current');

      const { data, error } = await supabase
        .from("transactions")
        .select("id, amount, type, date, category_id, transfer_id")
        .eq("user_id", userId)
        .gte("date", start)
        .lte("date", end)
        .is("transfer_id", null);

      if (error) throw error;

      const grouped: Record<string, { income: number; expense: number }> = {};

      (data as TransactionRow[]).forEach((t) => {
        const d = new Date(t.date);
        const amount = Number(t.amount) || 0;
        let label = "";

        if (filter === "weekly" || filter === "monthly") {
          label = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          });
        } else {
          label = d.toLocaleDateString("id-ID", {
            month: "short",
            year: "2-digit",
          });
        }

        if (!grouped[label]) grouped[label] = { income: 0, expense: 0 };
        // Gunakan amount yang sudah dikonversi
        if (t.type === "income") {
          grouped[label].income += amount;
        } else if (t.type === "expense") {
          grouped[label].expense += amount;
        }
      });

      return Object.entries(grouped).map(([label, { income, expense }]) => ({
        label,
        income,
        expense,
      }));
    },
    enabled: !!userId,
  });
}
