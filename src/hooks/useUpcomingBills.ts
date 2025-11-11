// src/hooks/useUpcomingBills.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "./useAuth";

// Tipe data untuk Tagihan Mendatang (Mirip dengan Category/Transaction)
interface RecurringBill {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  recurrence_rule: string;
  end_condition: string;
  category_id: string;
  categories: {
    name: string;
    icon: string;
    bgColor: string;
  };
}

/**
 * Hook untuk mengambil daftar Tagihan Berulang yang aktif.
 * Ini adalah TEMPLATE yang akan digunakan untuk pengingat.
 */
export function useUpcomingBills() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery<RecurringBill[]>({
    queryKey: ["upcomingBills", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("transactions")
        .select(
          `id, amount, type, date, note, is_recurring, recurrence_rule, end_condition, end_value, category_id, wallet_id, categories(name, icon, bgColor)`
        )
        .eq("user_id", userId)
        .eq("is_recurring", true)
        .order("date", { ascending: true });

      if (error) throw error;

      return data as any;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
