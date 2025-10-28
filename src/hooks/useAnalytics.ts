// import { useState, useEffect } from "react";
// import { AnalyticsData } from "@/types/model";

// export const useAnalytics = ({ userId, walletId, categoryId, range }: any) => {
//   const [data, setData] = useState<AnalyticsData>({
//     income: 0,
//     expense: 0,
//     balance: 0,
//     byCategory: [],
//     byDate: [],
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // simulasi loading 1 detik
//     setLoading(true);
//     const timeout = setTimeout(() => {
//       // 💰 data dummy income & expense total
//       const income = 12000000;
//       const expense = 8400000;

//       // 📊 data dummy kategori (pie chart)
//       const byCategory = [
//         { label: "Food", value: 2500000 },
//         { label: "Transport", value: 1000000 },
//         { label: "Entertainment", value: 1500000 },
//         { label: "Shopping", value: 2000000 },
//         { label: "Health", value: 1400000 },
//       ];

//       // 📈 data dummy tanggal (line / bar chart)
//       const byDate = [
//         { label: "2025-10-01", income: 2000000, expense: 1200000 },
//         { label: "2025-10-02", income: 2500000, expense: 1800000 },
//         { label: "2025-10-03", income: 1500000, expense: 2000000 },
//         { label: "2025-10-04", income: 3000000, expense: 1400000 },
//         { label: "2025-10-05", income: 3000000, expense: 2000000 },
//       ];

//       setData({
//         income,
//         expense,
//         balance: income - expense,
//         byCategory,
//         byDate,
//       });
//       setLoading(false);
//     }, 800);

//     return () => clearTimeout(timeout);
//   }, [userId, walletId, categoryId, range]);

//   return { data, loading };
// };

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";

type FilterType = "daily" | "weekly" | "monthly" | "yearly";

type TransactionRow = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category_id?: string;
};

function getDateRange(filter: FilterType) {
  const now = new Date();
  const start = new Date();

  switch (filter) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      start.setDate(now.getDate() - 7);
      break;
    case "monthly":
      start.setMonth(now.getMonth() - 1);
      break;
    case "yearly":
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start: start.toISOString(), end: now.toISOString() };
}

export function useAnalytics(userId?: string, filter: FilterType = "weekly") {
  return useQuery({
    queryKey: ["analytics", userId, filter],
    queryFn: async () => {
      if (!userId) return [];

      const { start, end } = getDateRange(filter);

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

        if (filter === "daily") {
          label = d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          });
        } else if (filter === "weekly" || filter === "monthly") {
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
