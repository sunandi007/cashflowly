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
        .select("*, categories(name, icon, type, bgColor)")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (start && end) {
        query = query.gte("date", start).lte("date", end);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // memastikan data terurut juga di sisi client
      return (data || []).sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!userId,
  });
}
